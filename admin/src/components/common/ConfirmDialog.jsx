import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Button from './Button.jsx';

const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isDangerous ? 'bg-red-100 text-red-600' : 'bg-primary-50 text-primary-600'
            }`}
          >
            <HiOutlineExclamationTriangle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-ink">{title}</h3>
            {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={isDangerous ? '!bg-red-600 hover:!bg-red-700' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
