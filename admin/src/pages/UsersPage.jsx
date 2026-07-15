import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getAllUsersApi, updateUserStatusApi } from '../api/userApi.js';
import Loader from '../components/common/Loader.jsx';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllUsersApi();
      setUsers(data.data.users);
      setFilteredUsers(data.data.users);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.role?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const handleToggleStatus = async (id, isActive) => {
    try {
      await updateUserStatusApi(id, !isActive);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Users</h1>

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
            {filteredUsers.map((user) => (
              <tr key={user._id || user.id}>
                <td className="font-medium">
                  <Link to={`/users/${user._id || user.id}`} className="hover:text-primary-600 hover:underline">
                    {user.name}
                  </Link>
                </td>
                <td>{user.email}</td>
                <td className="capitalize">{user.role}</td>
                <td>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(user._id || user.id, user.isActive)}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-ink/60">
            No users found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
