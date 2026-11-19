export default function WithdrawApplicationModal({ open, application, onClose, onConfirm }) {
  if (!open || !application) {
    return null;
  }

  return (
    <div className="modal applications-modal" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="modal-content applications-modal-content">
        <span className="applications-modal-eyebrow">سحب طلب التوظيف</span>
        <h2>سحب طلب التوظيف</h2>
        <p>هل أنت متأكد من رغبتك في سحب طلب التوظيف؟</p>
        <p className="applications-modal-note">بعد سحب الطلب، لن يظهر ضمن الوظائف المتقدم عليها.</p>
        <div className="applications-modal-actions">
          <button className="applications-modal-button secondary" type="button" onClick={onClose}>
            إلغاء
          </button>
          <button className="applications-modal-button danger" type="button" onClick={onConfirm}>
            سحب الطلب
          </button>
        </div>
      </div>
    </div>
  );
}
