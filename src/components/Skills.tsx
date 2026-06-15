import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  SiPython, SiPostgresql, SiMysql, SiApachespark,
  SiDatabricks, SiSnowflake, SiGooglebigquery,
  SiPandas, SiNumpy, SiSelenium, SiR,
  SiNotion, SiMetabase, SiN8N, SiApacheairflow,
  SiDocker, SiPlotly, SiStreamlit, SiApachekafka,
} from "react-icons/si";
import {
  FileSpreadsheet, Code2, FlaskConical,
  LayoutDashboard, Database, BarChart2, Cloud,
} from "lucide-react";
import type { ComponentType } from "react";

// ─── Types ────────────────────────────────────────────────────

interface Skill {
  name: string;
  Icon: ComponentType<{ className?: string }>;
}

interface SkillCategory {
  name:   string;
  Icon:   ComponentType<{ className?: string }>;
  /** Tailwind color token for the category accent dot */
  color:  string;
  skills: Skill[];
}

// ─── Data ─────────────────────────────────────────────────────

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name:  "BI & Visualization",
    Icon:  BarChart2,
    color: "hsl(12 52% 56%)",   // terracotta
    skills: [
      { name: "Power BI",     Icon: BarChart2       },
      { name: "Plotly",       Icon: SiPlotly        },
      { name: "Streamlit",    Icon: SiStreamlit     },
      { name: "Metabase",     Icon: SiMetabase      },
      { name: "Excel Charts", Icon: FileSpreadsheet },
    ],
  },
  {
    name:  "Data Engineering & ETL",
    Icon:  Database,
    color: "hsl(38 65% 52%)",   // gold
    skills: [
      { name: "PostgreSQL",    Icon: SiPostgresql    },
      { name: "MySQL",         Icon: SiMysql         },
      { name: "Apache Spark",  Icon: SiApachespark   },
      { name: "Apache Kafka",  Icon: SiApachekafka   },
      { name: "Airflow",       Icon: SiApacheairflow },
      { name: "n8n",           Icon: SiN8N           },
      { name: "Docker",        Icon: SiDocker        },
    ],
  },
  {
    name:  "Cloud & Modern Data Stack",
    Icon:  Cloud,
    color: "hsl(25 32% 44%)",   // mocha
    skills: [
      { name: "Databricks", Icon: SiDatabricks      },
      { name: "Snowflake",  Icon: SiSnowflake       },
      { name: "BigQuery",   Icon: SiGooglebigquery  },
    ],
  },
  {
    name:  "Programming & Querying",
    Icon:  Code2,
    color: "hsl(12 52% 56%)",
    skills: [
      { name: "Python",   Icon: SiPython   },
      { name: "Pandas",   Icon: SiPandas   },
      { name: "NumPy",    Icon: SiNumpy    },
      { name: "Selenium", Icon: SiSelenium },
      { name: "R",        Icon: SiR        },
    ],
  },
  {
    name:  "Spreadsheet Skills",
    Icon:  FileSpreadsheet,
    color: "hsl(38 65% 52%)",
    skills: [
      { name: "Excel",         Icon: FileSpreadsheet },
      { name: "Power Query",   Icon: FileSpreadsheet },
      { name: "Pivot Tables",  Icon: FileSpreadsheet },
      { name: "Macros / VBA",  Icon: Code2           },
    ],
  },
  {
    name:  "Methodologies",
    Icon:  FlaskConical,
    color: "hsl(25 32% 44%)",
    skills: [
      { name: "A/B Testing",         Icon: FlaskConical },
      { name: "Statistical Modeling", Icon: FlaskConical },
      { name: "OLS Regression",       Icon: FlaskConical },
      { name: "Hypothesis Testing",   Icon: FlaskConical },
      { name: "Agile",                Icon: FlaskConical },
    ],
  },
  {
    name:  "Workflow & Tools",
    Icon:  LayoutDashboard,
    color: "hsl(12 52% 56%)",
    skills: [
      { name: "Notion",          Icon: SiNotion        },
      { name: "KPI Tracking",    Icon: LayoutDashboard },
      { name: "Data Storytelling",Icon: LayoutDashboard },
    ],
  },
];

// ─── Animation variants ───────────────────────────────────────

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const } },
};

// ─── Component ────────────────────────────────────────────────

const Skills = () => (
  <section id="skills" className="py-20 bg-background">
    <div className="container mx-auto px-4">

      {/* ── Heading ── */}
      <div className="text-center mb-12">
        <span className="section-label">Tech Stack</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">
          <span className="gradient-text">Technical Skills</span>
        </h2>
        <p className="text-muted-foreground">Tools and technologies powering the work</p>
      </div>

      {/* ── Grid ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
      >
        {SKILL_CATEGORIES.map((category) => (
          <motion.div
            key={category.name}
            variants={itemVariants}
            className="bg-card border border-border rounded-2xl p-6 neon-glow-hover relative overflow-hidden"
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${category.color}, hsl(38 65% 52%))` }}
              aria-hidden="true"
            />

            {/* Category header */}
            <div className="flex items-center gap-3 mb-5 mt-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${category.color}1a` }}
              >
                <category.Icon className="h-4.5 w-4.5" style={{ color: category.color }} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{category.name}</h3>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <Badge
                  key={skill.name}
                  variant="outline"
                  className="bg-background/70 border-border text-foreground/80 text-xs px-2.5 py-1.5 flex items-center gap-1.5 hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors cursor-default"
                >
                  <skill.Icon className="h-3.5 w-3.5 opacity-75" />
                  {skill.name}
                </Badge>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Skills;
