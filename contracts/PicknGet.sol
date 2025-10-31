// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Admin.sol";
import "./Product.sol";
import "./User.sol";
import "./library/ItemLib.sol";

contract PicknGet is User, Admin{
    using ItemLib for string;
    uint8 constant DECIMALS = 8;
    uint256 public riderCount;

    constructor(address _superAdmin){
        SUPER_ADMIN = _superAdmin;
    }

    enum ItemStatus {Pending_Confirmation, Confirmed, Sold, Paid}
    enum RiderStatus {Pending, Approved, Rejected, Banned}
    enum VehicleType {Bike, Car, Truck, Van}
    enum Roles {Unassigned, Recycler, Rider, Admin}

   
    struct RecycledItems{
        uint256 itemId;
        uint256 weight;
        ItemLib.ItemType itemType;
        ItemStatus itemStatus;
        string description;
        bytes image;
    }

    struct RiderDetails {
        uint256 id;
        string name;
        string phoneNumber;
        string vehicleNumber;
        address walletAddress;
        string homeAddress;
        RiderStatus riderStatus;
        string country;
        uint256 capacity;
        bytes vehicleImage;
        bytes vehicleRegistrationImage;
        VehicleType vehicleType;
        bytes profilePicture;
    }
    
    mapping (uint256 => mapping(uint256 => bool)) public hasUserReceivedPayment;
    mapping (uint256 => mapping (uint256 => RecycledItems)) public itemByUserId;
    mapping (uint256 => bool) public hasRecycled;
    mapping (address => Roles ) public role;
    
    mapping (uint256 => uint256) public recycledItemId;
    mapping (uint256 => uint256) public totalRecycleddByUser;
    mapping (uint256 => uint256) public totalEarned;

    mapping (uint256 => RiderDetails) public riderId;
    mapping (uint256 => bool) public validRider;
    mapping (uint256 => bool) public isApproved;
    mapping(address => uint256) public riderIdByAddress;


    error AlreadyPaid();
    error NoRecycleItem();
    error InsufficientPayment();
    error NotConfirmed();
    error NotAllowed();

    event ItemRecycled(address indexed user, uint256 itemId, string itemType, uint256 weight);
    event PaidForRecycledItem(address indexed user, uint256 indexed userId, uint256 itemId, ItemLib.ItemType itemType);
    event RiderApproved(uint256 indexed riderId, string _name, 
                              string _number, 
                              string  _vehicleNumber,
                              bytes  _image,
                              string _country,
                              VehicleType _vehicleType);
    event RiderApplied(uint256 indexed riderId, address indexed wallet, string name);                         


    function registerUser(string memory _homeAddress, string memory _number, string memory _name, bytes memory _picture) public {
        if(role[msg.sender] == Roles.Admin || role[msg.sender] == Roles.Rider){
            revert ("User not allowed to apply as Recycler");
        }
        _registerUser( _homeAddress, _number, _name, _picture);
        role[msg.sender] = Roles.Recycler;
    }

    function registerAdmin(address _admin) public {
        if(role[msg.sender] == Roles.Recycler || role[msg.sender] == Roles.Rider){
            revert ("User not allowed to apply as an Admin");
        }
        _registerAdmin(_admin);
        role[_admin] = Roles.Admin; 

    }


    function riderApplication(string memory _name, 
                              string memory _number, 
                              string memory _vehicleNumber,
                              string memory _homeAddress,
                              string memory _country,
                              uint256 _capacity,
                              bytes memory _image,
                              bytes memory _vehicleRegistration,
                              VehicleType _vehicleType,
                              bytes memory _picture

                              ) public 
        {
        if(role[msg.sender] == Roles.Admin || role[msg.sender] == Roles.Recycler){
            revert ("User not allowed to apply as Rider");
        }
        require(riderIdByAddress[msg.sender] == 0, "Already applied");
        riderCount++;
        riderId[riderCount] = RiderDetails({
            id : riderCount,
            name : _name,
            phoneNumber : _number,
            vehicleNumber : _vehicleNumber,
            walletAddress : msg.sender,
            homeAddress : _homeAddress,
            riderStatus : RiderStatus.Pending,
            country : _country, 
            capacity : _capacity,
            vehicleImage : _image,
            vehicleRegistrationImage : _vehicleRegistration,
            vehicleType : _vehicleType,
            profilePicture : _picture
        }); 
        riderIdByAddress[msg.sender] = riderCount;
        emit RiderApplied(riderCount, msg.sender, _name);
    }

    function approveRider(uint256 _riderId) public {
        onlyAdmin();
        if(isApproved[_riderId]){
            revert ("Rider is already approved");
        }
        if(riderId[_riderId].id != _riderId){
            revert ("Rider does not exist with that Id");
        }
        if(riderId[_riderId].riderStatus == RiderStatus.Rejected){
            revert ("Rider is Rejected, needs to re-apply");
        }
        riderId[_riderId].riderStatus = RiderStatus.Approved;
        validRider[_riderId] = true;
        isApproved[_riderId] = true;
        role[riderId[_riderId].walletAddress] = Roles.Rider;
        emit RiderApproved(_riderId, riderId[_riderId].name, riderId[_riderId].phoneNumber, riderId[_riderId].vehicleNumber, riderId[_riderId].vehicleImage, riderId[_riderId].country, riderId[_riderId].vehicleType);
    }

    function banRider(uint256 _riderId) public {
        onlyAdmin();
        if(riderId[_riderId].id != _riderId){
            revert ("Rider does not exist with that Id");
        }
        if(riderId[_riderId].riderStatus == RiderStatus.Rejected){
            revert ("Rider is Rejected, needs to re-apply");
        }
        riderId[_riderId].riderStatus = RiderStatus.Banned;
        validRider[_riderId] = false;
    }
    
    function recycleItem(string memory _type, uint256 _weight, string memory _description, bytes memory _data) public { 
        if(!_isRegistered(msg.sender)){
            revert UserNotRegistered();
        }
        require(_weight > 0, "Invalid weight");

        uint256 id = userId[msg.sender];

        recycledItemId[id]++;

       itemByUserId[id][recycledItemId[id]] = RecycledItems({
            itemId: recycledItemId[id],
            weight: _weight,
            itemType: _type.toItemType(),
            itemStatus : ItemStatus.Pending_Confirmation,
            description: _description,
            image: _data
        });

        hasRecycled[id] = true;
        hasUserReceivedPayment[id][recycledItemId[id]] = false;
        totalRecycleddByUser[id] += _weight;
        emit ItemRecycled(msg.sender, recycledItemId[id], _type, _weight);
    }

    function confirmItem(uint256 _riderId, uint256 _userId, uint256 _recycleItemId) public {
        require(validRider[_riderId], "Not an approved rider");
        require(riderId[_riderId].walletAddress == msg.sender, "Only rider wallet can confirm");

        if(!validRider[_riderId]){
            revert NotAuthorised();
        }
        if(!hasRecycled[_userId]){
            revert NoRecycleItem();
        }
        require(_recycleItemId > 0 && _recycleItemId <= recycledItemId[_userId], "Invalid item ID");
        RecycledItems storage item = itemByUserId[_userId][_recycleItemId];
        require(item.itemId == _recycleItemId, "Item mismatch");
        item.itemStatus = ItemStatus.Confirmed;
    }

    function payUser(uint256 _userId, uint256 _recycledItemId) public payable {
        onlyAdmin();
        address user = userAccountId[_userId].userAddress;
        _isRegistered(_userId);
        if(itemByUserId[_userId][_recycledItemId].itemStatus != ItemStatus.Confirmed){
            revert NotConfirmed();
        }
        if(hasUserReceivedPayment[_userId][_recycledItemId] == true){
            revert AlreadyPaid();
        }

        uint256 itemWeight = itemByUserId[_userId][_recycledItemId].weight;
        ItemLib.ItemType _rType= itemByUserId[_userId][_recycledItemId].itemType;
        uint256 rate = rates[_rType];
        uint256 amount = itemWeight * rate;

        require(address(this).balance >= amount, "Insufficient contract balance");

        address payable recipient = payable(userAccountId[_userId].userAddress);

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        hasUserReceivedPayment[_userId][_recycledItemId] = true;
        totalEarned[_userId] += amount;

        emit PaidForRecycledItem(user, _userId, _recycledItemId, _rType);
    }

    function deleteUserAccount(address _user) public {
        _deleteUser(_user);
    }

    function deleteAdmin(address _admin) public {
        _deleteAdmin(_admin);
    }

    function setRate(ItemLib.ItemType _type, uint256 _rate) public {
        _setRate(_type, _rate);
    }
 
    function fundContract() external payable {
        require(msg.value > 0, "Must send some HBAR");
    }

    function contractBalance() external view returns (uint256) {
        onlyAdmin();
        return address(this).balance;
    }

    function getRole(address _user) public view returns (string memory) {
        Roles userRole = role[_user];

        if (userRole == Roles.Recycler) return "Recycler";
        if (userRole == Roles.Rider) return "Rider";
        if (userRole == Roles.Admin) return "Admin";
        return "Unassigned";
    }


    receive() external payable {}
    fallback() external payable {}    
}