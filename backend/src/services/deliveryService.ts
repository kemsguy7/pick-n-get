import {
  PickUpStatus,
  IPickUpDetails,
  VehicleType,
  RiderStatus,
  IRiderDetails,
  PickUp,
  Rider,
  ApprovalStatus,
} from '../interface/deliveryInterface.js';
import fetch from 'node-fetch';
import { session, database } from '../config/db.js';
import { AnyARecord } from 'dns';

const selectRide = async (type: VehicleType, country: string, pickupAddress: string) => {
  const riders = await Rider.find({
    vehicleType: { $regex: type, $options: 'i' },
    riderStatus: RiderStatus.Available,
    country: { $regex: country, $options: 'i' },
  });

  const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

  const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    pickupAddress,
  )}.json?access_token=${MAPBOX_API_KEY}`;

  const geocode = await fetch(geoUrl);
  if (!geocode.ok) throw new Error('Error geocoding pickup address');

  const geoData: any = await geocode.json();
  if (!geoData.features || geoData.features.length === 0)
    throw new Error('Pickup address not found');

  const [pickupLng, pickupLat] = geoData.features[0].center;

  const coords: any = [];
  for (let rider of riders) {
    const riderData = rider.toJSON() as any;

    try {
      const snapshot = await database.ref(`riders/${riderData.id}`).get();
      if (snapshot.exists()) {
        const location = snapshot.val();
        if (location.lat && location.lng) {
          coords.push({
            riderId: riderData.id,
            name: riderData.name,
            phoneNumber: riderData.phoneNumber,
            vehicleNumber: riderData.vehicleNumber,
            riderStatus: riderData.riderStatus,
            image: riderData.image,
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lng),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching rider location:', error);
    }
  }

  if (coords.length === 0) return null;
  const sources = `0`;
  const coordinates = [
    `${pickupLng},${pickupLat}`,
    ...coords.map((c: any) => `${c.lng},${c.lat}`),
  ].join(';');

  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}?sources=${sources}&annotations=distance,duration&access_token=${MAPBOX_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Mapbox API error');
    const data: any = await response.json();

    const durations = data.durations[0].slice(1);
    const riderDurations = coords.map((c: any, i: any) => ({
      ...c,
      duration: durations[i],
    }));

    riderDurations.sort((a: any, b: any) => a.duration - b.duration);
    return riderDurations.slice(0, 5);
  } catch (err) {
    console.error('Error fetching Mapbox durations:', err);
    return null;
  }
};

export const pickRider = async (
  type: VehicleType,
  country: string,
  pickupAddress: string,
  picked: number,
  details: IPickUpDetails,
) => {
  const availableRider = await selectRide(type, country, pickupAddress);

  if (!availableRider || availableRider.length === 0) {
    return { status: 'none', message: 'No riders available' };
  }

  if (picked < 0 || picked >= availableRider.length) {
    return { status: 'error', message: 'Invalid rider index' };
  }
  const riderData = availableRider[picked];

  return await session.withTransaction(async (_session: any) => {
    const selected = await Rider.findOne({ id: riderData.id }).session(_session);

    if (!selected || selected.get('riderStatus') !== RiderStatus.Available) {
      return { status: 'taken', message: 'Rider already busy' };
    }

    await Rider.findOneAndUpdate(
      { id: riderData.id },
      { riderStatus: RiderStatus.OnTrip },
      { session: _session },
    );

    const exist = await PickUp.find({
      id: selected._id,
      userId: details.userId,
      itemId: details.itemId,
    }).session(_session);

    if (exist.length > 0) {
      return { status: 'exists', pickUpStatus: exist };
    }

    if (!exist || exist.length <= 0) {
      const [newPickUp] = await PickUp.create(
        [
          {
            riderId: selected._id,
            userId: details.userId,
            itemId: details.itemId,
            customerName: details.customerName,
            pickUpAddress: details.pickupAddress,
            userPhoneNumber: details.customerPhoneNumber,
            pickUpStatus: details.pickUpStatus,
            description: details.description,
            image: details.image,
          },
        ],
        { session: _session },
      );

      return {
        status: 'success',
        data: {
          pickUpId: newPickUp.id,
          riderId: selected._id,
          userId: details.userId,
          itemId: details.itemId,
          pickUpAddress: details.pickupAddress,
          riderStatus: riderData.riderStatus,
          riderNumber: riderData.phoneNumber,
          riderName: riderData.name,
          customerName: details.customerName,
          customerNumber: details.customerPhoneNumber,
        },
      };
    }
  });
};

export const validateRide = async (validate: string, riderUUID: number, pickupUUID?: string) => {
  const findRider = await Rider.findOne({ id: riderUUID });

  if (!findRider) {
    throw new Error('Rider not found or not authorized');
  }

  let riderStatus: RiderStatus;
  let pickupStatus: PickUpStatus | null = null;

  if (validate === 'cancel') {
    riderStatus = RiderStatus.Available;
    await Rider.findOneAndUpdate({ id: riderUUID }, { riderStatus }, { new: true });
  } else if (validate === 'offline') {
    riderStatus = RiderStatus.OffLine;
    await Rider.findOneAndUpdate({ id: riderUUID }, { riderStatus }, { new: true });
  } else if (validate == 'available') {
    if (!pickupUUID) throw new Error("pickupUUID required for 'available' action");
    riderStatus = RiderStatus.OnTrip;
    pickupStatus = PickUpStatus.InTransit;
    await PickUp.findOneAndUpdate(
      { id: pickupUUID },
      {
        riderId: findRider._id,
        pickUpStatus: pickupStatus,
      },
      { new: true },
    );
    await Rider.findOneAndUpdate({ id: riderUUID }, { riderStatus }, { new: true });
  } else {
    throw new Error('Invalid validation option');
  }

  return {
    status: 'success',
    data: {
      pickupUUID,
      riderId: findRider.id,
      pickupStatus,
      riderStatus,
    },
  };
};

export const updatePickUpItem = async (
  itemStatus: string,
  pickupUUID: string,
  riderUUID: number,
) => {
  const findRider = await Rider.findOne({ id: riderUUID });

  if (!findRider) {
    throw new Error('Rider not found or not authorized');
  }

  const item: any = await PickUp.findOne({ id: pickupUUID });

  if (!item) {
    return { status: 'Pickup not found' };
  }

  if (item.pickUpStatus == 'Delivered') {
    return { status: 'item Already delivered' };
  }

  if (item.pickUpStatus == 'Cancelled') {
    return { status: 'Item Already Cancelled' };
  }

  if (item.pickUpStatus == itemStatus) {
    return { status: `item stattus is already: ${itemStatus}` };
  } else {
    item.pickUpStatus = itemStatus;
    await PickUp.findOneAndUpdate(
      { id: pickupUUID },
      {
        riderId: findRider._id,
        pickUpStatus: itemStatus,
      },
      { new: true },
    );
    return { status: `item status have been updated : ${itemStatus}` };
  }
};

export const totalPickUp = async (riderUUID: number) => {
  const findRider = await Rider.findOne({ id: riderUUID });

  if (!findRider) {
    throw new Error('Rider not found or not authorized');
  }
  let pickup: number = await PickUp.countDocuments({
    riderId: findRider._id,
    pickUpStatus: PickUpStatus.Delivered,
  });

  return {
    status: 'successful',
    result: pickup,
  };
};

export const createRider = async (riderDetails: IRiderDetails) => {
  try {
    // Check if rider already exists with this ID
    const exists = await Rider.findOne({ id: riderDetails.id });

    if (exists) {
      return {
        status: 'Rider already exists',
        message: `A rider with ID ${riderDetails.id} already exists`,
      };
    }

    // Check if phone number already exists
    const phoneExists = await Rider.findOne({ phoneNumber: riderDetails.phoneNumber });
    if (phoneExists) {
      return {
        status: 'error',
        message: 'Phone number already registered',
      };
    }

    // Check if vehicle number already exists
    const vehicleExists = await Rider.findOne({ vehicleNumber: riderDetails.vehicleNumber });
    if (vehicleExists) {
      return {
        status: 'error',
        message: 'Vehicle number already registered',
      };
    }

    // Check if wallet address already exists (if provided)
    if (riderDetails.walletAddress) {
      const walletExists = await Rider.findOne({ walletAddress: riderDetails.walletAddress });
      if (walletExists) {
        return {
          status: 'error',
          message: 'Wallet address already registered',
        };
      }
    }

    // Create new rider
    const newRider = new Rider({
      id: riderDetails.id,
      name: riderDetails.name,
      phoneNumber: riderDetails.phoneNumber,
      vehicleNumber: riderDetails.vehicleNumber,
      homeAddress: riderDetails.homeAddress,
      walletAddress: riderDetails.walletAddress,
      riderStatus: riderDetails.riderStatus || RiderStatus.Available,
      vehicleType: riderDetails.vehicleType,
      approvalStatus: riderDetails.approvalStatus || ApprovalStatus.Pending,
      country: riderDetails.country,
      capacity: riderDetails.capacity,

      // Vehicle details
      vehicleMakeModel: riderDetails.vehicleMakeModel,
      vehiclePlateNumber: riderDetails.vehiclePlateNumber,
      vehicleColor: riderDetails.vehicleColor,

      // IPFS CIDs
      profileImage: riderDetails.profileImage,
      driversLicense: riderDetails.driversLicense,
      vehicleRegistration: riderDetails.vehicleRegistration,
      insuranceCertificate: riderDetails.insuranceCertificate,
      vehiclePhotos: riderDetails.vehiclePhotos,
    });

    await newRider.save();

    return {
      status: 'success',
      message: `Rider created successfully with ID: ${newRider.id}`,
      data: {
        riderId: newRider.id,
        name: newRider.name,
        phoneNumber: newRider.phoneNumber,
        vehicleType: newRider.vehicleType,
        approvalStatus: newRider.approvalStatus,
        walletAddress: newRider.walletAddress,
        documents: {
          profileImage: newRider.profileImage,
          driversLicense: newRider.driversLicense,
          vehicleRegistration: newRider.vehicleRegistration,
          insuranceCertificate: newRider.insuranceCertificate,
          vehiclePhotos: newRider.vehiclePhotos,
        },
      },
    };
  } catch (e: any) {
    console.error('Error creating rider:', e);
    return {
      status: 'error',
      message: e.message || 'Error creating rider',
    };
  }
};

export const getRiderById = async (riderId: number) => {
  try {
    const rider = await Rider.findOne({ id: riderId });

    if (!rider) {
      return {
        status: 'error',
        message: 'Rider not found',
      };
    }

    return {
      status: 'success',
      data: {
        riderId: rider.id,
        name: rider.name,
        phoneNumber: rider.phoneNumber,
        vehicleNumber: rider.vehicleNumber,
        homeAddress: rider.homeAddress,
        walletAddress: rider.walletAddress,
        riderStatus: rider.riderStatus,
        vehicleType: rider.vehicleType,
        approvalStatus: rider.approvalStatus,
        country: rider.country,
        capacity: rider.capacity,

        // Vehicle details
        vehicleMakeModel: rider.vehicleMakeModel,
        vehiclePlateNumber: rider.vehiclePlateNumber,
        vehicleColor: rider.vehicleColor,

        // IPFS documents
        documents: {
          profileImage: rider.profileImage,
          driversLicense: rider.driversLicense,
          vehicleRegistration: rider.vehicleRegistration,
          insuranceCertificate: rider.insuranceCertificate,
          vehiclePhotos: rider.vehiclePhotos,
        },

        // Timestamps
        createdAt: rider.createdAt,
        updatedAt: rider.updatedAt,
      },
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const getAllRiders = async () => {
  try {
    const riders = await Rider.find({});

    const ridersData = riders.map((rider : any) => ({
      riderId: rider.id,
      name: rider.name,
      phoneNumber: rider.phoneNumber,
      vehicleNumber: rider.vehicleNumber,
      walletAddress: rider.walletAddress,
      riderStatus: rider.riderStatus,
      vehicleType: rider.vehicleType,
      approvalStatus: rider.approvalStatus,
      country: rider.country,
      capacity: rider.capacity,
      vehicleMakeModel: rider.vehicleMakeModel,
      vehiclePlateNumber: rider.vehiclePlateNumber,
      vehicleColor: rider.vehicleColor,
      hasProfileImage: !!rider.profileImage,
      hasDriversLicense: !!rider.driversLicense,
      hasVehicleRegistration: !!rider.vehicleRegistration,
      hasInsuranceCertificate: !!rider.insuranceCertificate,
      hasVehiclePhotos: !!rider.vehiclePhotos,
      createdAt: rider.createdAt,
      updatedAt: rider.updatedAt,
    }));

    return {
      status: 'success',
      count: riders.length,
      data: ridersData,
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const updateRiderApproval = async (riderId: number, action: 'approve' | 'reject') => {
  try {
    const rider = await Rider.findOne({ id: riderId });

    if (!rider) {
      return {
        status: 'error',
        message: 'Rider not found',
      };
    }

    // ✅ FIX: Use string values to match database
    let newStatus: string;
    if (action === 'approve') {
      newStatus = 'Approved'; // ✅ Changed from ApprovalStatus.Approve
    } else {
      newStatus = 'Rejected'; // ✅ Changed from ApprovalStatus.Reject
    }

    console.log(
      `🔄 Updating rider ${riderId} approval status from ${rider.approvalStatus} to ${newStatus}`,
    );

    const updatedRider = await Rider.findOneAndUpdate(
      { id: riderId },
      { approvalStatus: newStatus },
      { new: true },
    );

    console.log(`✅ Rider approval updated successfully: ${updatedRider!.approvalStatus}`);

    return {
      status: 'success',
      message: `Rider ${action}d successfully`,
      data: {
        riderId: updatedRider!.id,
        name: updatedRider!.name,
        approvalStatus: updatedRider!.approvalStatus,
        vehicleType: updatedRider!.vehicleType,
        walletAddress: updatedRider!.walletAddress,
      },
    };
  } catch (error: any) {
    console.error(`❌ Error updating rider approval:`, error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const getPendingRiders = async () => {
  try {
    const pendingRiders = await Rider.find({
      approvalStatus: 'Pending',
    }).sort({ createdAt: -1 });

    const ridersData = pendingRiders.map((rider: any) => ({
      riderId: rider.id,
      name: rider.name,
      phoneNumber: rider.phoneNumber,
      vehicleNumber: rider.vehicleNumber,
      vehicleType: rider.vehicleType,
      country: rider.country,
      capacity: rider.capacity,
      homeAddress: rider.homeAddress,
      walletAddress: rider.walletAddress,
      approvalStatus: rider.approvalStatus,
      riderStatus: rider.riderStatus,
      submissionDate: rider.createdAt,
      vehicleMakeModel: rider.vehicleMakeModel,
      vehiclePlateNumber: rider.vehiclePlateNumber,
      vehicleColor: rider.vehicleColor,
      documents: {
        profileImage: rider.profileImage,
        driversLicense: rider.driversLicense,
        vehicleRegistration: rider.vehicleRegistration,
        insuranceCertificate: rider.insuranceCertificate,
        vehiclePhotos: rider.vehiclePhotos,
      },
    }));

    return {
      status: 'success',
      message: `Found ${ridersData.length} pending riders`,
      data: {
        count: ridersData.length,
        riders: ridersData,
      },
    };
  } catch (error: any) {
    console.error('❌ Error getting pending riders:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const updateRiderDetails = async (riderId: number, updates: any) => {
  try {
    const rider = await Rider.findOne({ id: riderId });

    if (!rider) {
      return {
        status: 'error',
        message: 'Rider not found',
      };
    }

    const updatedRider = await Rider.findOneAndUpdate({ id: riderId }, updates, { new: true });

    return {
      status: 'success',
      message: 'Rider updated successfully',
      data: {
        riderId: updatedRider!.id,
        name: updatedRider!.name,
        capacity: updatedRider!.capacity,
        vehicleType: updatedRider!.vehicleType,
        approvalStatus: updatedRider!.approvalStatus,
        riderStatus: updatedRider!.riderStatus,
      },
    };
  } catch (error: any) {
    console.error('❌ Error updating rider:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};
