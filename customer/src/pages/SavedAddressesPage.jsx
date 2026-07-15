import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { deleteAddressApi } from '../api/authApi.js';
import AddressCard from '../components/checkout/AddressCard.jsx';
import AddressFormModal from '../components/checkout/AddressFormModal.jsx';
import { HiOutlinePlus } from 'react-icons/hi2';

const SavedAddressesPage = () => {
  const { user, setUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const addresses = user?.addresses || [];

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteAddressApi(addressId);
      setUser({
        ...user,
        addresses: addresses.filter(addr => addr._id !== addressId)
      });
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  return (
    <div className="container-tgs py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">Saved Addresses</h1>
          <p className="mt-2 text-sm text-charcoal/60">Manage your delivery addresses</p>
        </div>
        <button
          onClick={handleAddAddress}
          className="flex items-center gap-2 rounded-xl border-2 border-charcoal/20 px-4 py-3 text-sm font-medium text-charcoal transition-colors duration-300 hover:border-primary-500 hover:text-primary-600"
        >
          <HiOutlinePlus size={18} />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-medium text-charcoal">No saved addresses</p>
          <p className="mt-2 text-sm text-charcoal/60">Add your first delivery address</p>
          <button
            onClick={handleAddAddress}
            className="mt-6 btn-primary inline-flex"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              isSelected={false}
              onSelect={() => {}}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddressFormModal
          isOpen={showModal}
          onClose={handleModalClose}
          address={editingAddress}
          onSuccess={() => {
            handleModalClose();
          }}
        />
      )}
    </div>
  );
};

export default SavedAddressesPage;
