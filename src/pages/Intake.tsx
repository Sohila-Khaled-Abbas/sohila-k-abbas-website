import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IntakeForm from "@/components/IntakeForm";
import SEO from "@/components/SEO";

const Intake = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Project Inquiry — Sohila Khaled Abbas"
        description="Tell me about your data or BI project. Intake form for consulting and collaboration on dashboards, pipelines, and analytics infrastructure."
        path="/intake"
      />
      <Header />
      <main className="pt-24">
        <IntakeForm />
      </main>
      <Footer />
    </div>
  );
};

export default Intake;
