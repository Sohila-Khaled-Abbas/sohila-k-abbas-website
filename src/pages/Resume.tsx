
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Linkedin, Github, Globe, Download, Printer, Eye } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";

const profileJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Sohila Khaled Abbas",
    jobTitle: "BI Developer & Data Analytics Engineer",
    url: "https://sohilakhaled-portfolio.lovable.app/resume",
    sameAs: [
      "https://linkedin.com/in/sohilakabbas",
      "https://github.com/Sohila-Khaled-Abbas",
    ],
  },
};

const Resume = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <SEO
        title="Résumé — Sohila Khaled Abbas, Data Analyst"
        description="Full résumé of Sohila Khaled Abbas: BI dashboards, ETL automation, SQL, Python and Power BI experience. Available to view, download, or print."
        path="/resume"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(profileJsonLd)}</script>
      </Helmet>
      <style>
        {`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            .print-break { page-break-before: always; }
            .container { max-width: none !important; margin: 0 !important; padding: 0 !important; }
            .shadow-md { box-shadow: none !important; }
            .bg-card { background: white !important; }
            .text-muted-foreground { color: #666 !important; }
            .border { border: 1px solid #ddd !important; }
          }
        `}
      </style>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <div className="text-center mb-8 no-print">
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
            I'm a results-driven Data Analyst with a passion for automating workflows, building interactive dashboards, and sharing insights with a community of 25,000+ professionals. Below is my full résumé, which you can explore online, download as a PDF, or print directly.
          </p>
          
          {/* Top Controls */}
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            <a 
              href="https://drive.google.com/file/d/134BGo0ox7ClojNGwiT6IKX0eZKIjjncd/view?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-5 py-2 rounded hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View PDF
            </a>
            <a 
              href="/Sohila_Khaled_Abbas_Resume.pdf" 
              download
              className="bg-secondary text-secondary-foreground px-5 py-2 rounded hover:bg-secondary/80 transition-colors inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button 
              onClick={() => window.print()}
              className="bg-accent text-accent-foreground px-5 py-2 rounded hover:bg-accent/80 transition-colors inline-flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {/* Resume Content */}
        <Card className="bg-card dark:bg-card-dark shadow-md">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">SOHILA KHALED ABBAS</h1>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Damietta, Egypt (Open to Remote & Hybrid Roles)
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  (+2) 01114919021
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  sohilakhaled811@gmail.com
                </div>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-4 mt-2 text-sm">
                <a href="https://linkedin.com/in/sohilakabbas" className="flex items-center gap-1 text-primary hover:underline">
                  <Linkedin className="h-4 w-4" />
                  linkedin.com/in/sohilakabbas
                </a>
                <a href="https://github.com/Sohila-Khaled-Abbas" className="flex items-center gap-1 text-primary hover:underline">
                  <Github className="h-4 w-4" />
                  github.com/Sohila-Khaled-Abbas
                </a>
                <a href="/" className="flex items-center gap-1 text-primary hover:underline">
                  <Globe className="h-4 w-4" />
                  Portfolio
                </a>
              </div>
            </div>

            {/* Professional Summary */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 border-b-2 border-primary pb-1">PROFESSIONAL SUMMARY</h2>
              <p className="text-foreground dark:text-foreground-dark leading-relaxed">
                Results-driven Data Analyst with expertise in transforming raw data into actionable business insights through interactive dashboards and automated reporting. Proficient in SQL, Python, Power BI, and Excel with demonstrated success in reducing reporting time by 40% and improving data accuracy by 25%. Recognized among Egypt's Top 2 Data Science Creators with 25K+ followers. Seeking an entry-level Data Analyst or Business Intelligence Analyst role.
              </p>
            </section>

            {/* Skills */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 border-b-2 border-primary pb-1">SKILLS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Technical:</h3>
                  <p className="text-sm text-muted-foreground mb-3">SQL, Python, R, Power BI, Tableau, Excel (Pivot Tables, Macros), ETL, Data Modeling, DAX</p>
                  
                  <h3 className="font-semibold mb-2">Analysis:</h3>
                  <p className="text-sm text-muted-foreground">Dashboard Design, KPI Tracking, A/B Testing, Statistical Analysis, Data Cleaning, EDA</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Libraries:</h3>
                  <p className="text-sm text-muted-foreground mb-3">Pandas, NumPy, Matplotlib, Seaborn, BeautifulSoup, Selenium, SciPy, StatsModels</p>
                  
                  <h3 className="font-semibold mb-2">Soft Skills:</h3>
                  <p className="text-sm text-muted-foreground">Data Storytelling, Communication, Analytical Thinking, Problem-solving</p>
                </div>
              </div>
            </section>

            {/* Work Experience */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 border-b-2 border-primary pb-1">WORK EXPERIENCE</h2>
              
              {/* FlyRank AI */}
              <div className="mb-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-base">Machine Learning Engineer (Intern)</h3>
                  <span className="text-sm text-muted-foreground">July 2026 - Present</span>
                </div>
                <div className="text-sm text-primary font-medium mb-2">FlyRank AI (Remote)</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                  <li>Developed feature engineering workflows and model-ready datasets using Python, Workbench, and JupyterLab</li>
                  <li>Applied machine learning techniques alongside analytics engineering practices to improve data preparation and deployment readiness</li>
                  <li>Collaborated on integrating predictive models into broader data and BI ecosystems</li>
                </ul>
              </div>

              {/* Data Pill DE */}
              <div className="mb-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-base">Data Engineer (Intern)</h3>
                  <span className="text-sm text-muted-foreground">March 2026 - Present</span>
                </div>
                <div className="text-sm text-primary font-medium mb-2">Data Pill (Remote)</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                  <li>Designed ELT workflows and dimensional data models in Databricks, leveraging dbt</li>
                  <li>Engineered distributed Apache Spark pipelines to process large-scale datasets</li>
                  <li>Built enterprise ETL solutions using SSIS and Informatica</li>
                  <li>Implemented warehouse-ready data models aligned with Kimball principles</li>
                </ul>
              </div>

              {/* Freelance BI */}
              <div className="mb-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-base">Business Intelligence Developer</h3>
                  <span className="text-sm text-muted-foreground">December 2024 - Present</span>
                </div>
                <div className="text-sm text-primary font-medium mb-2">Freelance (Remote)</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                  <li>Architected 10+ Power BI solutions using dimensional modeling</li>
                  <li>Automated data ingestion and ELT workflows with Python and Apache Airflow</li>
                  <li>Optimized Power BI semantic models and DAX measures, reducing refresh latency</li>
                  <li>Refactored legacy T-SQL workloads, reducing query execution times by 25%</li>
                </ul>
              </div>

              {/* DEPI Coach */}
              <div className="mb-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-base">Technical Coach</h3>
                  <span className="text-sm text-muted-foreground">September 2025 - June 2026</span>
                </div>
                <div className="text-sm text-primary font-medium mb-2">Digital Egypt Pioneers Initiative (DEPI) (Part-Time, Remote)</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                  <li>Mentored 50+ professionals in analytics solutions (SQL, Python, Power BI)</li>
                  <li>Conducted 100+ technical reviews improving code quality</li>
                  <li>Guided optimization initiatives and developed frameworks for statistical interpretation</li>
                </ul>
              </div>

              {/* Data Pill Mentor */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-base">Data Analytics Mentor</h3>
                  <span className="text-sm text-muted-foreground">July 2025 - April 2026</span>
                </div>
                <div className="text-sm text-primary font-medium mb-2">Data Pill (Part-Time, Remote)</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                  <li>Reviewed and optimized SQL queries, Python workflows, and data models</li>
                  <li>Designed realistic business intelligence scenarios for learners</li>
                  <li>Coached learners on analytics engineering best practices and dimensional modeling</li>
                </ul>
              </div>
            </section>

            {/* Projects */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 border-b-2 border-primary pb-1">PROJECTS</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">SMART Supply Chain Insights Dashboard</h3>
                    <span className="text-sm text-muted-foreground">May 2025</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Tools: Power BI, Python, Excel, DAX</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Developed a comprehensive dashboard to monitor logistics efficiency and supplier reliability KPIs</li>
                    <li>Integrated Python and Excel for data preprocessing across multiple supply chain sources</li>
                    <li>Visualized insights using Power BI with DAX-driven metrics for optimization opportunities</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Marketing Data A/B Testing Project</h3>
                    <span className="text-sm text-muted-foreground">May 2025</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Tools: Python (Pandas, SciPy), SQL, Excel</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Conducted A/B testing analysis using statistical methods to validate marketing campaign effectiveness</li>
                    <li>Applied chi-square testing to confirm statistical significance, providing actionable insights</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Wuzzuf Job Market Analysis Dashboard</h3>
                    <span className="text-sm text-muted-foreground">March 2025</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Tools: Power BI, Python (BeautifulSoup, Selenium)</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Scraped and analyzed 200+ job postings, extracting patterns in role requirements</li>
                    <li>Developed an interactive dashboard used by 200+ users to explore job market trends</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Education */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 border-b-2 border-primary pb-1">EDUCATION</h2>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Damietta University</h3>
                  <p className="text-sm text-muted-foreground">Bachelor of Science in Agricultural Sciences</p>
                  <p className="text-sm text-muted-foreground">Relevant Coursework: Statistics and Probability, Research Methodology, Economics</p>
                </div>
                <span className="text-sm text-muted-foreground">October 2020 - July 2024</span>
              </div>
            </section>

            {/* Certifications */}
            <section className="mb-4">
              <h2 className="text-xl font-semibold mb-3 border-b-2 border-primary pb-1">CERTIFICATIONS, DIPLOMAS & RECOGNITION</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Certifications:</h3>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Python (Basic) — HackerRank (Apr 2026)</li>
                    <li>SQL Associate — DataCamp (Sep 2025)</li>
                    <li>Data Engineer Associate — DataCamp (Sep 2025)</li>
                    <li>Python Data Associate — DataCamp (Sep 2025)</li>
                    <li>Data Analyst Associate — DataCamp (Sep 2025)</li>
                    <li>Top SQL 50 — LeetCode (Jan 2025)</li>
                    <li>Data Scientist Associate — DataCamp (Sep 2025)</li>
                    <li>SQL (Basic, Intermediate, Advanced) — HackerRank (Dec 2024)</li>
                    <li>Data Analytics Essentials — Cisco</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Key Recent Courses & Diplomas:</h3>
                  <ul className="list-disc list-inside space-y-1 pl-1 mb-3">
                    <li>Data Analytics Diploma (Ahmed Ali / Friendly Analysis) — Mar 2026 – May 2026</li>
                    <li>Data Warehouse: The Ultimate Guide (Udemy) — Dec 2026</li>
                    <li>Build with AI: Masr Edition (ITI) — May 2026</li>
                    <li>Various courses via 365 Data Science, IBM, Google Cloud, and LinkedIn Learning</li>
                  </ul>
                  <h3 className="font-semibold text-foreground mb-1">Recognition:</h3>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li><strong>Top 2 Data Science Creator – Egypt | Favikon (June 2025)</strong></li>
                    <li>Built a community of 60K+ data professionals on LinkedIn</li>
                    <li>Demonstrated thought leadership in data visualization</li>
                  </ul>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resume;
