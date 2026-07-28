import { useState } from 'react';
import Button from '../common/Button.jsx';
import CatalogMasterMultiSelect from '../catalogMaster/CatalogMasterMultiSelect.jsx';
import { useForm } from 'react-hook-form';

const OPERATIONS = [
  { value: 'addTags', label: 'Add Tags', field: 'tags', type: 'tag', operation: 'add' },
  { value: 'removeTags', label: 'Remove Tags', field: 'tags', type: 'tag', operation: 'remove' },
  { value: 'addRecipient', label: 'Add Recipient', field: 'recipient', type: 'recipient', operation: 'add' },
  { value: 'removeRecipient', label: 'Remove Recipient', field: 'recipient', type: 'recipient', operation: 'remove' },
  { value: 'addOccasion', label: 'Add Occasion', field: 'occasion', type: 'occasion', operation: 'add' },
  { value: 'removeOccasion', label: 'Remove Occasion', field: 'occasion', type: 'occasion', operation: 'remove' },
];

const BulkEditModal = ({ isOpen, onClose, productCount, onSubmit }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, watch, reset } = useForm({
    defaultValues: {
      tags: [],
      recipient: [],
      occasion: [],
    },
  });

  const watchedValues = watch();

  const handleOperationChange = (e) => {
    const operation = OPERATIONS.find((op) => op.value === e.target.value);
    setSelectedOperation(operation);
    reset();
  };

  const handleBulkEdit = async () => {
    if (!selectedOperation) return;

    const values = watchedValues[selectedOperation.field];
    if (!values || values.length === 0) {
      alert('Please select at least one value');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        operation: selectedOperation.operation,
        field: selectedOperation.field,
        values: watchedValues[selectedOperation.field],
      });
      setShowConfirm(false);
      onClose();
      reset();
      setSelectedOperation(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setSelectedOperation(null);
    setShowConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Bulk Edit Products</h2>
          <button onClick={handleClose} className="text-ink/50 hover:text-ink">
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-ink/60">
          {productCount} product(s) selected
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Operation</label>
          <select
            className="input-field"
            value={selectedOperation?.value || ''}
            onChange={handleOperationChange}
          >
            <option value="">Select an operation...</option>
            {OPERATIONS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {selectedOperation && (
          <div className="mb-4">
            <CatalogMasterMultiSelect
              control={control}
              name={selectedOperation.field}
              type={selectedOperation.type}
              label={selectedOperation.field.charAt(0).toUpperCase() + selectedOperation.field.slice(1)}
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkEdit}
            disabled={!selectedOperation}
          >
            Apply
          </Button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md">
            <h3 className="mb-2 text-lg font-semibold text-ink">Confirm Bulk Edit</h3>
            <p className="mb-6 text-sm text-ink/60">
              You are about to update {productCount} product(s).
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSubmit} isLoading={isSubmitting}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkEditModal;
