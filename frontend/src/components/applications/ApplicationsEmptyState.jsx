import { Link } from 'react-router-dom';

export default function ApplicationsEmptyState() {
  return (
    <section className="applications-empty">
      <div className="applications-empty-icon">
        <i className="fas fa-file-circle-plus" />
      </div>
      <h2>لا توجد طلبات توظيف حتى الآن</h2>
      <p>ابدأ بتصفح الوظائف المتاحة وتقدّم للفرص التي تناسب مهاراتك وطموحاتك.</p>
      <Link className="applications-empty-button" to="/jobs">
        تصفح الوظائف
      </Link>
    </section>
  );
}
