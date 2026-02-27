import { useEffect, useState } from "react";
import {
  getAdminStats,
  getMembershipStats,
} from "../services/adminDashboard.service";
import AdminStats from "../components/AdminStats";
import AdminQuickActions from "../components/AdminQuickActions";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [membershipStats, setMembershipStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [statsData, membershipData] = await Promise.all([
          getAdminStats(),
          getMembershipStats(),
        ]);

        setStats(statsData);
        setMembershipStats(membershipData);
      } catch (error) {
        console.error("Error cargando dashboard admin:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <p className="p-6">Cargando dashboard admin…</p>;

  const totalPlans =
    (membershipStats?.freemium ?? 0) +
    (membershipStats?.premium ?? 0) +
    (membershipStats?.plus ?? 0);

  const freemiumPct = totalPlans
    ? Math.round(((membershipStats?.freemium ?? 0) / totalPlans) * 100)
    : 0;
  const premiumPct = totalPlans
    ? Math.round(((membershipStats?.premium ?? 0) / totalPlans) * 100)
    : 0;
  const plusPct = totalPlans
    ? Math.round(((membershipStats?.plus ?? 0) / totalPlans) * 100)
    : 0;

  return (
    <div className="p-6 space-y-8">
  
      <AdminStats stats={stats} />


      <AdminQuickActions />

      {/* Distribución de planes */}
      {membershipStats && (
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Distribución de Membresías
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded border">
              <p className="text-sm text-gray-500">Freemium</p>
              <p className="text-2xl font-semibold text-gray-800">
                {membershipStats.freemium ?? 0}
              </p>
              <p className="text-xs text-gray-400">{freemiumPct}%</p>

              <div className="mt-3 h-2 bg-gray-100 rounded">
                <div
                  className="h-2 bg-gray-400 rounded"
                  style={{ width: `${freemiumPct}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded border">
              <p className="text-sm text-gray-500">Premium</p>
              <p className="text-2xl font-semibold text-gray-800">
                {membershipStats.premium ?? 0}
              </p>
              <p className="text-xs text-gray-400">{premiumPct}%</p>

              <div className="mt-3 h-2 bg-gray-100 rounded">
                <div
                  className="h-2 bg-[#F7A82A] rounded"
                  style={{ width: `${premiumPct}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded border">
              <p className="text-sm text-gray-500">Plus</p>
              <p className="text-2xl font-semibold text-gray-800">
                {membershipStats.plus ?? 0}
              </p>
              <p className="text-xs text-gray-400">{plusPct}%</p>

              <div className="mt-3 h-2 bg-gray-100 rounded">
                <div
                  className="h-2 bg-[#22687B] rounded"
                  style={{ width: `${plusPct}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Total usuarios considerados: <b>{totalPlans}</b>
          </p>
        </section>
      )}
    </div>
  );
}