import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';

export const RealTimeDashboard = () => {
  const { isConnected, lastMessage } = useWebSocket();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'dashboard_update':
          setDashboardData(lastMessage.payload);
          break;
        case 'activity_update':
          setActivities(prev => [lastMessage.payload, ...prev.slice(0, 49)]);
          break;
        case 'notification':
          setNotifications(prev => [lastMessage.payload, ...prev.slice(0, 19)]);
          break;
      }
    }
  }, [lastMessage]);

  return (
    <div className="real-time-dashboard">
      <div className="connection-status mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-600 font-medium">Connected to Real-time Server</span>
            </>
          ) : (
            <>
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-red-600 font-medium">Disconnected</span>
            </>
          )}
        </div>
      </div>

      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Data Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Real-time Data</h3>
          <div className="bg-gray-50 p-4 rounded border">
            <pre className="text-sm text-gray-700 overflow-auto max-h-64">
              {dashboardData ? JSON.stringify(dashboardData, null, 2) : 'No data received yet...'}
            </pre>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Notifications</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <div className="font-medium text-blue-800">{notification.title}</div>
                  <div className="text-sm text-blue-600 mt-1">{notification.message}</div>
                  <div className="text-xs text-blue-500 mt-2">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">No notifications yet...</div>
            )}
          </div>
        </div>

        {/* Activity Stream Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Activity Stream</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  <div className="font-medium text-green-800">{activity.type}</div>
                  <div className="text-sm text-green-600 mt-1">{activity.description}</div>
                  <div className="text-xs text-green-500 mt-2">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">No activities yet...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
