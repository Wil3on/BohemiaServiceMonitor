import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, RefreshCcw, AlertTriangle } from 'lucide-react';
import { UptimeChart } from './components/UptimeChart';

interface Service {
  name: string;
  online: boolean;
  online_24_hours: number;
  online_7_days: number;
  last_success: string;
  last_error: string;
  latency: number;
  failures_24_hours: number;
}

interface ServiceInfo {
  name: string;
  url?: string;
}

interface WorkshopStatus {
  online: boolean;
  latency: number;
}

function UpdatedTimestamp({ date }: { date: Date }) {
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    return date.toLocaleString();
  };

  const formatExactTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isRecent = (new Date().getTime() - date.getTime()) < 5000;

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${
          isRecent ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
        }`} />
        <div className="text-gray-400">
          Updated <span className="font-medium">{formatTimeAgo(date)}</span>
        </div>
      </div>
      <div className="text-gray-500 text-xs">
        {formatExactTime(date)}
      </div>
    </div>
  );
}

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [workshopStatus, setWorkshopStatus] = useState<WorkshopStatus>({ online: false, latency: 0 });

  const targetServices: ServiceInfo[] = [
    { name: 'Main Page', url: 'https://www.bohemia.net' },
    { name: 'Arma Reforger Game API' },
    { name: 'Arma Reforger Workshop API', url: 'https://reforger.armaplatform.com/workshop' }
  ];

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://bohemia.status.anrop.se/api/services'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const data = JSON.parse(result.contents);
      
      const filteredServices = data.filter((service: Service) => 
        targetServices.map(s => s.name).includes(service.name)
      );
      setServices(filteredServices);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Unable to fetch service status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkWorkshopWebsite = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://reforger.armaplatform.com/workshop'));
      const endTime = Date.now();
      setWorkshopStatus({
        online: response.ok,
        latency: endTime - startTime
      });
    } catch (error) {
      setWorkshopStatus({ online: false, latency: 0 });
    }
  };

  useEffect(() => {
    fetchData();
    checkWorkshopWebsite();
    const interval = setInterval(() => {
      fetchData();
      checkWorkshopWebsite();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timeAgo = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (timeAgo < 60) return 'Just now';
    if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)}m ago`;
    if (timeAgo < 86400) return `${Math.floor(timeAgo / 3600)}h ago`;
    return date.toLocaleString();
  };

  const formatLatency = (latency: number) => {
    return (latency / 1000).toFixed(2) + 's';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCcw className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-md p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-100">Connection Error</h2>
          </div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchData();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col">
      <div className="container mx-auto" style={{ maxWidth: "50%" }}> {/* Added fixed width container */}
        <div className="w-full flex-grow">
          <div className="flex justify-center"> {/* Added wrapper for centering */}
            <div className="w-3/4 flex-grow"> {/* Changed from w-1/2 to w-3/4 (75% width) */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Activity className="w-8 h-8 text-blue-500" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-100">
                  Bohemia Interactive Service Status Monitor
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setLoading(true);
                      fetchData();
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-gray-800 transition-colors"
                    title="Refresh now"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                  <UpdatedTimestamp date={lastUpdate} />
                </div>
              </div>

              <div className="grid gap-8 grid-cols-1 animate-[fadeIn_0.5s_ease-in]">
                {services.map((service) => (
                  <div key={service.name} className="bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-8 w-full">
                    {/* Header section */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                      <h2 className="text-2xl font-bold text-gray-100 text-center flex items-center gap-3">
                        {service.name} {/* Remove the URL/link from service name */}
                        {service.online ? (
                          <span className="text-base text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Online
                          </span>
                        ) : (
                          <span className="text-base text-red-500 bg-red-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Offline
                          </span>
                        )}
                      </h2>
                      
                      {/* Workshop Website Status - make text clickable */}
                      {service.name === 'Arma Reforger Workshop API' && (
                        <div className="flex items-center gap-2 mt-2 mb-8">
                          <a 
                            href="https://reforger.armaplatform.com/workshop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            Workshop Website:
                          </a>
                          {workshopStatus.online ? (
                            <span className="text-sm text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Online ({(workshopStatus.latency / 1000).toFixed(2)}s)
                            </span>
                          ) : (
                            <span className="text-sm text-red-500 bg-red-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Offline
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Add Chart before Stats Grid */}
                    <div className="mb-8 bg-gray-900 rounded-lg p-4 hover:bg-gray-800/50 transition-colors duration-300">
                      <UptimeChart 
                        uptime24h={service.online_24_hours} 
                        uptime7d={service.online_7_days}
                      />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      {[
                        { 
                          label: '24h Uptime', 
                          value: `${service.online_24_hours.toFixed(2)}%`,
                          tooltip: 'Percentage of time the service was online in the last 24 hours'
                        },
                        { 
                          label: '7d Uptime', 
                          value: `${service.online_7_days.toFixed(2)}%`,
                          tooltip: 'Percentage of time the service was online in the last 7 days'
                        }
                      ].map(({ label, value, tooltip }) => (
                        <div key={label} className="text-center p-4 bg-gray-900 rounded-lg hover:scale-105 transition-transform cursor-default group relative">
                          <div className="text-sm text-gray-400 mb-1">{label}</div>
                          <div className="text-2xl font-bold text-gray-100">{value}</div>
                          <div className="invisible group-hover:visible absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-xs text-gray-100 rounded whitespace-nowrap z-10">
                            {tooltip}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="text-center p-4 bg-gray-900 rounded-lg hover:scale-105 transition-transform cursor-default group relative">
                        <div className="text-sm text-gray-400 mb-1">Latency</div>
                        <div className="text-2xl font-bold text-gray-100 flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5 text-blue-500" />
                          {formatLatency(service.latency)}
                        </div>
                        <div className="invisible group-hover:visible absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-xs text-gray-100 rounded whitespace-nowrap z-10">
                          Current response time
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-900 rounded-lg hover:scale-105 transition-transform cursor-default group relative">
                        <div className="text-sm text-gray-400 mb-1">Failures (24h)</div>
                        <div className="text-2xl font-bold text-red-500">
                          {service.failures_24_hours}
                        </div>
                        <div className="invisible group-hover:visible absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-xs text-gray-100 rounded whitespace-nowrap z-10">
                          Number of failures in the last 24 hours
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { 
                            label: 'Last Success', 
                            value: service.last_success, 
                            className: 'text-green-500',
                            tooltip: 'Last time the service responded successfully'
                          },
                          { 
                            label: 'Last Error', 
                            value: service.last_error, 
                            className: 'text-red-500',
                            tooltip: 'Last time the service failed to respond'
                          }
                        ].map(({ label, value, className, tooltip }) => (
                          <div key={label} className="text-center p-4 bg-gray-900 rounded-lg hover:scale-105 transition-transform cursor-default group relative">
                            <div className="text-sm font-medium text-gray-400 mb-1">{label}</div>
                            <div className={`text-sm ${className}`}>{formatDate(value)}</div>
                            <div className="invisible group-hover:visible absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-xs text-gray-100 rounded whitespace-nowrap z-10">
                              {tooltip}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-8 pb-4">
        <p>v 0.1.8 • Made with ❤️ by <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Wil3son</a></p>
        <p>ProjecX Arma Servers @ Discord: <a href="https://discord.gg/s4ZYfU3DUv" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">ProjecX Arma</a></p>
      </footer>
    </div>
  );
}

export default App;