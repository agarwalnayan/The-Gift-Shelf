import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getCustomersApi, updateUserStatusApi } from '../api/userApi.js';
import Loader from '../components/common/Loader.jsx';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const { data } = await getCustomersApi();
      setCustomers(data.data.users);
      setFilteredCustomers(data.data.users);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (customer) =>
            customer.name?.toLowerCase().includes(query) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.role?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, customers]);

  const handleToggleStatus = async (id, isActive) => {
    try {
      await updateUserStatusApi(id, !isActive);
      toast.success('Customer status updated');
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    }
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Customers</h1>

      <div className="mb-4">
        <div className="relative">
          <HiOutlineMagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-ink/20 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table-base">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id || customer.id}>
                <td className="font-medium">
                  <Link to={`/users/${customer._id || customer.id}`} className="hover:text-primary-600 hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td>{customer.email}</td>
                <td className="capitalize">{customer.role}</td>
                <td>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      customer.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
                    }`}
                  >
                    {customer.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(customer._id || customer.id, customer.isActive)}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    {customer.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="p-8 text-center text-ink/60">
            No customers found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
