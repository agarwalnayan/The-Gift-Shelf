import Button from '../common/Button.jsx';

const ProductBulkActionsBar = ({ count, onAction, onClear }) => {
  if (count === 0) return null;

  return (
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 !bg-primary-50">
      <p className="text-sm font-medium text-primary-700">{count} product(s) selected</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => onAction('activate')}>Activate</Button>
        <Button variant="secondary" onClick={() => onAction('deactivate')}>Deactivate</Button>
        <Button variant="secondary" onClick={() => onAction('publish')}>Publish</Button>
        <Button variant="secondary" onClick={() => onAction('draft')}>Move to Draft</Button>
        <Button variant="secondary" onClick={() => onAction('feature')}>Feature</Button>
        <Button variant="secondary" onClick={() => onAction('unfeature')}>Unfeature</Button>
        <Button className="!bg-red-600 hover:!bg-red-700" onClick={() => onAction('delete')}>
          Move to Trash
        </Button>
        <Button variant="secondary" onClick={onClear}>Clear</Button>
      </div>
    </div>
  );
};

export default ProductBulkActionsBar;
