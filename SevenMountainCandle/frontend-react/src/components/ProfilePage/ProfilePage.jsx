import "./ProfilePage.scss";

export default function ProfilePage({ user, onLogout }) {
  return (
    <main className="profile-page">
      <section className="profile-panel">
        <p className="eyebrow">Profile</p>
        <h2>{user?.name || "Guest"}</h2>
        <p className="profile-copy">Manage your account details and continue to checkout faster.</p>

        <dl className="profile-details">
          <div>
            <dt>Email</dt>
            <dd>{user?.email || "Not provided"}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{user?.phone || "Not provided"}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{user?.address || "Not provided"}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{user?.city || "Not provided"}</dd>
          </div>
        </dl>

        <button type="button" onClick={onLogout}>Logout</button>
      </section>
    </main>
  );
}
