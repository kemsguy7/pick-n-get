import { Request, Response } from 'express';
import { Rider, ApprovalStatus, VehicleType } from '../models/riderModel.js';
import { User, UserRole, UserStatus } from '../models/userModel';
import { PickUp, PickUpStatus } from '../models/pickupModel';

/**
 * Get overall dashboard statistics
 * GET /api/v1/admin/stats/dashboard
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching dashboard statistics...');

    // Get current date for time-based calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run all queries in parallel for better performance
    const [
      totalUsers,
      totalActiveUsers,
      totalRiders,
      activeRiders,
      approvedRiders,
      pendingRiders,
      rejectedRiders,
      totalPickups,
      completedPickups,
      pendingPickups,
      todayPickups,
      monthlyPickups,
      lastMonthPickups,
      todayApprovals,
      todayRejections,
      totalEarnings,
    ] = await Promise.all([
      // User statistics
      User.countDocuments(),
      User.countDocuments({ status: UserStatus.Active }),

      // Rider statistics
      Rider.countDocuments(),
      Rider.countDocuments({
        approvalStatus: ApprovalStatus.Approve,
        riderStatus: { $ne: 'Off-line' },
      }),
      Rider.countDocuments({ approvalStatus: ApprovalStatus.Approve }),
      Rider.countDocuments({ approvalStatus: ApprovalStatus.Pending }),
      Rider.countDocuments({ approvalStatus: ApprovalStatus.Reject }),

      // Pickup statistics
      PickUp.countDocuments(),
      PickUp.countDocuments({ pickUpStatus: PickUpStatus.Delivered }),
      PickUp.countDocuments({
        pickUpStatus: { $in: [PickUpStatus.Pending, PickUpStatus.InTransit] },
      }),
      PickUp.countDocuments({ createdAt: { $gte: todayStart } }),
      PickUp.countDocuments({ createdAt: { $gte: monthStart } }),
      PickUp.countDocuments({
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),

      // Today's approvals and rejections
      Rider.countDocuments({
        approvalStatus: ApprovalStatus.Approve,
        updatedAt: { $gte: todayStart },
      }),
      Rider.countDocuments({
        approvalStatus: ApprovalStatus.Reject,
        updatedAt: { $gte: todayStart },
      }),

      // Calculate total platform earnings
      PickUp.aggregate([
        { $match: { pickUpStatus: PickUpStatus.Delivered } },
        { $group: { _id: null, total: { $sum: '$estimatedEarnings' } } },
      ]),
    ]);

    // Calculate growth percentages
    const userGrowthRate =
      lastMonthPickups > 0
        ? (((monthlyPickups - lastMonthPickups) / lastMonthPickups) * 100).toFixed(1)
        : '0.0';

    const pickupGrowthRate =
      lastMonthPickups > 0
        ? (((monthlyPickups - lastMonthPickups) / lastMonthPickups) * 100).toFixed(1)
        : '0.0';

    // Calculate success rates
    const pickupSuccessRate =
      totalPickups > 0 ? ((completedPickups / totalPickups) * 100).toFixed(1) : '100.0';

    const riderApprovalRate =
      approvedRiders + pendingRiders + rejectedRiders > 0
        ? ((approvedRiders / (approvedRiders + pendingRiders + rejectedRiders)) * 100).toFixed(1)
        : '0.0';

    // Format total earnings
    const platformRevenue =
      totalEarnings.length > 0 ? `$${(totalEarnings[0].total || 0).toLocaleString()}` : '$0';

    const dashboardStats = {
      // Core metrics
      totalUsers,
      activeUsers: totalActiveUsers,
      totalRiders,
      activeAgents: activeRiders,
      verifiedVendors: approvedRiders, // Using approved riders as "verified vendors"
      pendingApprovals: pendingRiders,

      // Financial metrics
      platformRevenue,
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total || 0 : 0,

      // Activity metrics
      totalPickups,
      completedPickups,
      pendingPickups,
      todayPickups,
      monthlyPickups,

      // Growth metrics

      userGrowthRate: `${parseFloat(userGrowthRate) > 0 ? '+' : ''}${userGrowthRate}%`,
      pickupGrowthRate: `${parseFloat(pickupGrowthRate) > 0 ? '+' : ''}${pickupGrowthRate}%`,
      // Success rates
      pickupSuccessRate: `${pickupSuccessRate}%`,
      riderApprovalRate: `${riderApprovalRate}%`,

      // Today's activity
      approvedToday: todayApprovals,
      rejectedToday: todayRejections,

      // System health (todo make dynamic)
      systemUptime: '99.8%',
      transactionSuccessRate: '96.2%',
      userEngagement: '87%',
    };

    console.log(`✅ Dashboard stats calculated successfully`);
    console.log(`   - Total Users: ${totalUsers}`);
    console.log(`   - Active Agents: ${activeRiders}`);
    console.log(`   - Pending Approvals: ${pendingRiders}`);
    console.log(`   - Platform Revenue: ${platformRevenue}`);

    res.status(200).json({
      status: 'success',
      message: 'Dashboard statistics fetched successfully',
      data: dashboardStats,
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get detailed user statistics
 * GET /api/v1/admin/stats/users
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    console.log('👥 Fetching user statistics...');

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      recyclers,
      admins,
      superAdmins,
      usersWithPickups,
      topRecyclers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: UserStatus.Active }),
      User.countDocuments({ status: UserStatus.Inactive }),
      User.countDocuments({ status: UserStatus.Suspended }),
      User.countDocuments({ roles: UserRole.Recycler }),
      User.countDocuments({ roles: UserRole.Admin }),
      User.countDocuments({ roles: UserRole.SuperAdmin }),
      User.countDocuments({ totalPickups: { $gt: 0 } }),
      User.find({ totalRecycled: { $gt: 0 } })
        .sort({ totalRecycled: -1 })
        .limit(5)
        .select('name totalRecycled totalEarnings co2Saved'),
    ]);

    const userStats = {
      total: totalUsers,
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
      },
      byRole: {
        recyclers,
        admins,
        superAdmins,
      },
      engagement: {
        usersWithPickups,
        engagementRate: totalUsers > 0 ? ((usersWithPickups / totalUsers) * 100).toFixed(1) : '0.0',
      },
      topRecyclers,
    };

    res.status(200).json({
      status: 'success',
      message: 'User statistics fetched successfully',
      data: userStats,
    });
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get detailed rider statistics
 * GET /api/v1/admin/stats/riders
 */
export const getRiderStats = async (req: Request, res: Response) => {
  try {
    console.log('🚴 Fetching rider statistics...');

    const [
      totalRiders,
      pendingRiders,
      approvedRiders,
      rejectedRiders,
      ridersByVehicle,
      ridersByCountry,
      activeRiders,
      ridersOnTrip,
    ] = await Promise.all([
      Rider.countDocuments(),
      Rider.countDocuments({ approvalStatus: ApprovalStatus.Pending }),
      Rider.countDocuments({ approvalStatus: ApprovalStatus.Approve }),
      Rider.countDocuments({ approvalStatus: ApprovalStatus.Reject }),

      // Group by vehicle type
      Rider.aggregate([{ $group: { _id: '$vehicleType', count: { $sum: 1 } } }]),

      // Group by country
      Rider.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Rider.countDocuments({
        approvalStatus: ApprovalStatus.Approve,
        riderStatus: 'Available',
      }),
      Rider.countDocuments({
        approvalStatus: ApprovalStatus.Approve,
        riderStatus: 'On-Trip',
      }),
    ]);

    const riderStats = {
      total: totalRiders,
      byStatus: {
        pending: pendingRiders,
        approved: approvedRiders,
        rejected: rejectedRiders,
      },
      byVehicleType: ridersByVehicle.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byCountry: ridersByCountry,
      operational: {
        available: activeRiders,
        onTrip: ridersOnTrip,
        offline: totalRiders - activeRiders - ridersOnTrip,
      },
      approvalRate: totalRiders > 0 ? ((approvedRiders / totalRiders) * 100).toFixed(1) : '0.0',
    };

    res.status(200).json({
      status: 'success',
      message: 'Rider statistics fetched successfully',
      data: riderStats,
    });
  } catch (error) {
    console.error('❌ Error fetching rider stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch rider statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get recent platform activity
 * GET /api/v1/admin/activity/recent
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    console.log('📈 Fetching recent activity...');

    const limit = parseInt(req.query.limit as string) || 10;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [recentUsers, recentRiders, recentPickups, recentApprovals] = await Promise.all([
      User.find({ createdAt: { $gte: oneDayAgo } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name createdAt roles'),

      Rider.find({ createdAt: { $gte: oneDayAgo } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name createdAt approvalStatus vehicleType'),

      PickUp.find({ createdAt: { $gte: oneDayAgo } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('customerName createdAt pickUpStatus itemCategory'),

      Rider.find({
        approvalStatus: ApprovalStatus.Approve,
        updatedAt: { $gte: oneDayAgo },
      })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('name updatedAt vehicleType'),
    ]);

    // Format activity feed
    const activities: Array<{
      type: string;
      message: string;
      timestamp: Date;
      details?: any;
    }> = [];

    // Add user registrations
    recentUsers.forEach((user) => {
      activities.push({
        type: 'user_registration',
        message: `New user registered: ${user.name}`,
        timestamp: user.createdAt!,
        details: { roles: user.roles },
      });
    });

    // Add rider applications
    recentRiders.forEach((rider) => {
      activities.push({
        type: 'rider_application',
        message: `New ${rider.vehicleType.toLowerCase()} rider applied: ${rider.name}`,
        timestamp: rider.createdAt!,
        details: {
          status: rider.approvalStatus,
          vehicleType: rider.vehicleType,
        },
      });
    });

    // Add pickup requests
    recentPickups.forEach((pickup) => {
      activities.push({
        type: 'pickup_request',
        message: `New ${pickup.itemCategory} pickup from ${pickup.customerName}`,
        timestamp: pickup.createdAt!,
        details: {
          status: pickup.pickUpStatus,
          category: pickup.itemCategory,
        },
      });
    });

    // Add approvals
    recentApprovals.forEach((rider) => {
      activities.push({
        type: 'rider_approval',
        message: `${rider.vehicleType} rider approved: ${rider.name}`,
        timestamp: rider.updatedAt!,
        details: { vehicleType: rider.vehicleType },
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.status(200).json({
      status: 'success',
      message: 'Recent activity fetched successfully',
      data: {
        activities: activities.slice(0, limit),
        summary: {
          newUsers: recentUsers.length,
          newRiders: recentRiders.length,
          newPickups: recentPickups.length,
          newApprovals: recentApprovals.length,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recent activity',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get system alerts (you can enhance this based on your monitoring needs)
 * GET /api/v1/admin/alerts/system
 */
export const getSystemAlerts = async (req: Request, res: Response) => {
  try {
    console.log('🚨 Fetching system alerts...');

    // Calculate some basic system health indicators
    const [pendingRiders, failedPickups, suspendedUsers, oldPendingPickups] = await Promise.all([
      Rider.countDocuments({ approvalStatus: ApprovalStatus.Pending }),
      PickUp.countDocuments({ pickUpStatus: PickUpStatus.Cancelled }),
      User.countDocuments({ status: UserStatus.Suspended }),
      PickUp.countDocuments({
        pickUpStatus: PickUpStatus.Pending,
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    const alerts = [];

    // High pending riders alert
    if (pendingRiders > 10) {
      alerts.push({
        id: 'high_pending_riders',
        type: 'warning',
        title: 'High Pending Approvals',
        message: `${pendingRiders} riders awaiting approval`,
        timestamp: new Date(),
        priority: 'medium',
      });
    }

    // Failed pickups alert
    if (failedPickups > 5) {
      alerts.push({
        id: 'failed_pickups',
        type: 'error',
        title: 'High Cancellation Rate',
        message: `${failedPickups} pickups cancelled in recent period`,
        timestamp: new Date(),
        priority: 'high',
      });
    }

    // Suspended users alert
    if (suspendedUsers > 0) {
      alerts.push({
        id: 'suspended_users',
        type: 'info',
        title: 'Suspended Users',
        message: `${suspendedUsers} users currently suspended`,
        timestamp: new Date(),
        priority: 'low',
      });
    }

    // Old pending pickups
    if (oldPendingPickups > 0) {
      alerts.push({
        id: 'old_pending_pickups',
        type: 'warning',
        title: 'Stale Pickup Requests',
        message: `${oldPendingPickups} pickups pending for more than 24 hours`,
        timestamp: new Date(),
        priority: 'medium',
      });
    }

    // Default healthy state
    if (alerts.length === 0) {
      alerts.push({
        id: 'system_healthy',
        type: 'info',
        title: 'System Operating Normally',
        message: 'All systems running smoothly',
        timestamp: new Date(),
        priority: 'low',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'System alerts fetched successfully',
      data: {
        alerts,
        alertCount: alerts.length,
        systemHealth: alerts.length <= 1 ? 'healthy' : alerts.length <= 3 ? 'warning' : 'critical',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching system alerts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system alerts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
