import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Play, Save, X, Search, Filter, Globe, Lock, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const APIManagementSystem = () => {
  const [apis, setApis] = useState([
    {
      id: 1,
      name: 'User Authentication API',
      url: 'https://api.example.com/auth',
      method: 'POST',
      status: 'active',
      version: 'v1.2.0',
      description: 'API สำหรับการยืนยันตัวตนผู้ใช้',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
      lastTested: '2024-01-15',
      responseTime: 120,
      uptime: 99.5,
      category: 'Authentication'
    },
    {
      id: 2,
      name: 'Product Catalog API',
      url: 'https://api.example.com/products',
      method: 'GET',
      status: 'active',
      version: 'v2.1.0',
      description: 'API สำหรับดึงข้อมูลสินค้า',
      headers: { 'Content-Type': 'application/json' },
      lastTested: '2024-01-14',
      responseTime: 85,
      uptime: 98.2,
      category: 'Product'
    },
    {
      id: 3,
      name: 'Payment Gateway API',
      url: 'https://api.payment.com/charge',
      method: 'POST',
      status: 'maintenance',
      version: 'v1.0.0',
      description: 'API สำหรับการชำระเงิน',
      headers: { 'Content-Type': 'application/json', 'API-Key': 'secret-key' },
      lastTested: '2024-01-10',
      responseTime: 200,
      uptime: 95.8,
      category: 'Payment'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentApi, setCurrentApi] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [testResults, setTestResults] = useState({});

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  };

  const methodColors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800'
  };

  const filteredApis = apis.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || api.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddApi = () => {
    setCurrentApi({
      name: '',
      url: '',
      method: 'GET',
      status: 'active',
      version: '',
      description: '',
      headers: {},
      category: ''
    });
    setShowModal(true);
  };

  const handleEditApi = (api) => {
    setCurrentApi({ ...api });
    setShowModal(true);
  };

  const handleDeleteApi = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบ API นี้?')) {
      setApis(apis.filter(api => api.id !== id));
    }
  };

  const handleSaveApi = () => {
    if (!currentApi.name || !currentApi.url) {
      alert('กรุณากรอกชื่อและ URL ของ API');
      return;
    }

    if (currentApi.id) {
      setApis(apis.map(api => api.id === currentApi.id ? currentApi : api));
    } else {
      const newApi = {
        ...currentApi,
        id: Math.max(...apis.map(a => a.id), 0) + 1,
        lastTested: new Date().toISOString().split('T')[0],
        responseTime: Math.floor(Math.random() * 200) + 50,
        uptime: Math.floor(Math.random() * 5) + 95
      };
      setApis([...apis, newApi]);
    }
    setShowModal(false);
    setCurrentApi(null);
  };

  const handleTestApi = async (api) => {
    setTestResults({ ...testResults, [api.id]: { loading: true } });
    
    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      const responseTime = Math.floor(Math.random() * 200) + 50;
      
      setTestResults({
        ...testResults,
        [api.id]: {
          loading: false,
          success,
          responseTime,
          message: success ? 'API ทำงานปกติ' : 'เชื่อมต่อ API ไม่สำเร็จ',
          timestamp: new Date().toLocaleString('th-TH')
        }
      });

      // Update API's last tested date and response time
      setApis(prevApis => 
        prevApis.map(a => 
          a.id === api.id 
            ? { ...a, lastTested: new Date().toISOString().split('T')[0], responseTime }
            : a
        )
      );
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Management System</h1>
              <p className="text-gray-600 mt-2">จัดการและติดตาม APIs ทั้งหมดของคุณ</p>
            </div>
            <button
              onClick={handleAddApi}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม API ใหม่
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                รายการ API
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
            </nav>
          </div>

          {activeTab === 'list' && (
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหา API..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                    <option value="maintenance">ปรับปรุง</option>
                  </select>
                </div>
              </div>

              {/* API List */}
              <div className="space-y-4">
                {filteredApis.map(api => (
                  <div key={api.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodColors[api.method]}`}>
                            {api.method}
                          </span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(api.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[api.status]}`}>
                              {api.status === 'active' ? 'ใช้งาน' : api.status === 'inactive' ? 'ไม่ใช้งาน' : 'ปรับปรุง'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{api.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <span>{api.url}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{api.responseTime}ms</span>
                          </div>
                          <span>Uptime: {api.uptime}%</span>
                          <span>v{api.version}</span>
                        </div>
                        {testResults[api.id] && (
                          <div className={`mt-2 p-2 rounded text-sm ${
                            testResults[api.id].loading 
                              ? 'bg-blue-50 text-blue-800' 
                              : testResults[api.id].success 
                                ? 'bg-green-50 text-green-800' 
                                : 'bg-red-50 text-red-800'
                          }`}>
                            {testResults[api.id].loading 
                              ? 'กำลังทดสอบ API...' 
                              : `${testResults[api.id].message} (${testResults[api.id].responseTime}ms) - ${testResults[api.id].timestamp}`
                            }
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleTestApi(api)}
                          disabled={testResults[api.id]?.loading}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="ทดสอب API"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditApi(api)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteApi(api.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">API ทั้งหมด</h3>
                  <p className="text-3xl font-bold">{apis.length}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">ใช้งานได้</h3>
                  <p className="text-3xl font-bold">{apis.filter(api => api.status === 'active').length}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">เวลาตอบสนองเฉลี่ย</h3>
                  <p className="text-3xl font-bold">
                    {Math.round(apis.reduce((sum, api) => sum + api.responseTime, 0) / apis.length)}ms
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">สถานะ API</h3>
                  <div className="space-y-3">
                    {['active', 'maintenance', 'inactive'].map(status => {
                      const count = apis.filter(api => api.status === status).length;
                      const percentage = (count / apis.length) * 100;
                      const statusText = status === 'active' ? 'ใช้งาน' : status === 'maintenance' ? 'ปรับปรุง' : 'ไม่ใช้งาน';
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{statusText}</span>
                            <span>{count} APIs</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === 'active' ? 'bg-green-500' : 
                                status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">API ล่าสุด</h3>
                  <div className="space-y-3">
                    {apis.slice(0, 5).map(api => (
                      <div key={api.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{api.name}</p>
                          <p className="text-sm text-gray-500">ทดสอบล่าสุด: {api.lastTested}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(api.status)}
                          <span className="text-sm text-gray-600">{api.responseTime}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentApi?.id ? 'แก้ไข API' : 'เพิ่ม API ใหม่'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ API</label>
                  <input
                    type="text"
                    value={currentApi?.name || ''}
                    onChange={(e) => setCurrentApi({ ...currentApi, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น User Authentication API"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="url"
                    value={currentApi?.url || ''}
                    onChange={(e) => setCurrentApi({ ...currentApi, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                    <select
                      value={currentApi?.method || 'GET'}
                      onChange={(e) => setCurrentApi({ ...currentApi, method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                    <select
                      value={currentApi?.status || 'active'}
                      onChange={(e) => setCurrentApi({ ...currentApi, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">ใช้งาน</option>
                      <option value="inactive">ไม่ใช้งาน</option>
                      <option value="maintenance">ปรับปรุง</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เวอร์ชัน</label>
                    <input
                      type="text"
                      value={currentApi?.version || ''}
                      onChange={(e) => setCurrentApi({ ...currentApi, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="v1.0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                    <input
                      type="text"
                      value={currentApi?.category || ''}
                      onChange={(e) => setCurrentApi({ ...currentApi, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Authentication, Product, Payment"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                  <textarea
                    value={currentApi?.description || ''}
                    onChange={(e) => setCurrentApi({ ...currentApi, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="อธิบายฟังก์ชันของ API"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveApi}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIManagementSystem;