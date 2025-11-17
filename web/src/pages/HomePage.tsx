import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Compass, Layers, Zap } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MetricCard from '../components/insights/MetricCard';
import WorkflowCard from '../components/workflows/WorkflowCard';
import WorkflowFilter from '../components/workflows/WorkflowFilter';
import { Button } from '../components/ui/button';
import { fetchWorkflows } from '../api/workflows';
import type { Workflow } from '../types/workflow';

const HomePage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchWorkflows().then(setWorkflows);
  }, []);

  const filteredWorkflows = useMemo(() => {
    if (statusFilter === 'all') return workflows;
    return workflows.filter((workflow) => workflow.status === statusFilter);
  }, [statusFilter, workflows]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-10 text-white shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Intelligent orchestration</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">
                Monitor, orchestrate and debug
                <br />
                every workflow in a single canvas.
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-slate-200">
                The Einoflow console gives you a live view of your automations with actionable insights, health signals
                and collaborative tooling built with shadcn/ui and TailwindCSS.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" className="shadow-xl">
                  Create workflow
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white">
                  Explore blueprints
                </Button>
              </div>
            </div>
            <div className="grid w-full gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur lg:w-[320px]">
              <div>
                <p className="text-sm text-slate-300">Active workflows</p>
                <p className="text-5xl font-semibold">128</p>
              </div>
              <div className="space-y-3 text-sm text-slate-200">
                <p className="flex items-center justify-between">
                  Healthy <span className="font-semibold text-emerald-300">86%</span>
                </p>
                <p className="flex items-center justify-between">
                  Degraded <span className="font-semibold text-amber-300">9%</span>
                </p>
                <p className="flex items-center justify-between">
                  Failed <span className="font-semibold text-rose-300">5%</span>
                </p>
              </div>
              <p className="text-xs text-slate-400">Realtime signals aggregated from the orchestration cluster.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Avg. throughput" value="842 / min" trend="+18% vs last week" icon={Zap} />
          <MetricCard label="Workflow latency" value="320 ms" trend="-8% vs last deploy" icon={BarChart3} accent="bg-emerald-100 text-emerald-700" />
          <MetricCard label="Active blueprints" value="42" trend="+5 curated" icon={Layers} accent="bg-indigo-100 text-indigo-700" />
          <MetricCard label="Experiment paths" value="9" trend="New" icon={Compass} accent="bg-rose-100 text-rose-700" />
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Workflow inventory</h3>
              <p className="text-sm text-slate-500">Explore the orchestration graph with fast filters and live telemetry.</p>
            </div>
            <WorkflowFilter activeStatus={statusFilter} onStatusChange={setStatusFilter} />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
            {filteredWorkflows.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                No workflows match this state. Adjust your filters or create a new workflow.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
