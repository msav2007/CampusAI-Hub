import type { ResumeData } from "@/lib/resume/types";

export function ResumePreview({ data }: { data: ResumeData }) {
  const { settings } = data;

  const getThemeColors = () => {
    switch (settings?.theme) {
      case "modern":
        return { text: "text-slate-800", heading: "text-blue-700", border: "border-blue-700" };
      case "minimal":
        return { text: "text-gray-900", heading: "text-gray-900", border: "border-gray-200" };
      case "professional":
        return { text: "text-gray-800", heading: "text-slate-900", border: "border-slate-800" };
      default:
        return { text: "text-black", heading: "text-gray-800", border: "border-gray-300" };
    }
  };

  const getFontSize = () => {
    switch (settings?.fontSize) {
      case "small": return "text-[11px] leading-snug";
      case "large": return "text-[14px] leading-relaxed";
      default: return "text-[12px] leading-normal";
    }
  };

  const getSpacing = () => {
    switch (settings?.spacing) {
      case "compact": return "mb-2 space-y-2";
      case "spacious": return "mb-6 space-y-5";
      default: return "mb-4 space-y-3";
    }
  };

  const getHeaderSpacing = () => {
    switch (settings?.spacing) {
      case "compact": return "mb-3";
      case "spacious": return "mb-8";
      default: return "mb-5";
    }
  };

  const colors = getThemeColors();
  const fontSize = getFontSize();
  const spacing = getSpacing();
  const headerSpacing = getHeaderSpacing();

  return (
    <div
      className={`mx-auto bg-white p-8 ${colors.text} ${fontSize} font-sans shadow-lg`}
      style={{ width: "210mm", minHeight: "297mm", boxSizing: "border-box" }}
    >
      {/* Header */}
      <header className={`text-center ${headerSpacing}`}>
        <h1 className={`text-3xl font-bold uppercase tracking-wider ${colors.heading}`}>
          {data.personalInfo.fullName}
        </h1>
        <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm opacity-80">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.email && data.personalInfo.phone && <span>|</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.phone && data.personalInfo.location && <span>|</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-2 text-sm opacity-80">
          {data.personalInfo.linkedinUrl && (
            <a href={`https://${data.personalInfo.linkedinUrl}`} className="hover:underline">
              {data.personalInfo.linkedinUrl}
            </a>
          )}
          {data.personalInfo.linkedinUrl && data.personalInfo.githubUrl && <span>|</span>}
          {data.personalInfo.githubUrl && (
            <a href={`https://${data.personalInfo.githubUrl}`} className="hover:underline">
              {data.personalInfo.githubUrl}
            </a>
          )}
          {data.personalInfo.githubUrl && data.personalInfo.portfolioUrl && <span>|</span>}
          {data.personalInfo.portfolioUrl && (
            <a href={`https://${data.personalInfo.portfolioUrl}`} className="hover:underline">
              {data.personalInfo.portfolioUrl}
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className={spacing}>
          <p className="opacity-90">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className={spacing}>
          <h2 className={`mb-2 border-b-2 ${colors.border} pb-1 text-lg font-bold uppercase tracking-wider ${colors.heading}`}>
            Experience
          </h2>
          <div className={spacing}>
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold">
                  <span>{exp.company}</span>
                  <span className="font-normal opacity-70">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between italic opacity-90 mb-1">
                  <span>{exp.role}</span>
                  <span>{exp.location}</span>
                </div>
                {exp.details.length > 0 && (
                  <ul className="list-inside list-disc opacity-90">
                    {exp.details.map((detail, index) => (
                      <li key={index} className="pl-2">
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className={spacing}>
          <h2 className={`mb-2 border-b-2 ${colors.border} pb-1 text-lg font-bold uppercase tracking-wider ${colors.heading}`}>
            Education
          </h2>
          <div className={spacing}>
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between font-bold">
                  <span>{edu.institution}</span>
                  <span className="font-normal opacity-70">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <div className="flex justify-between italic opacity-90 mb-1">
                  <span>
                    {edu.degree} in {edu.field}
                  </span>
                  <span>{edu.score}</span>
                </div>
                {edu.details.length > 0 && (
                  <ul className="list-inside list-disc opacity-90">
                    {edu.details.map((detail, index) => (
                      <li key={index} className="pl-2">
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className={spacing}>
          <h2 className={`mb-2 border-b-2 ${colors.border} pb-1 text-lg font-bold uppercase tracking-wider ${colors.heading}`}>
            Projects
          </h2>
          <div className={spacing}>
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span>{proj.name}</span>
                    {proj.link && (
                      <a href={`https://${proj.link}`} className="text-xs font-normal opacity-80 hover:underline">
                        {proj.link}
                      </a>
                    )}
                  </div>
                  {proj.technologies && (
                    <span className="font-normal opacity-70">{proj.technologies}</span>
                  )}
                </div>
                {proj.description && <p className="italic opacity-90 mb-1">{proj.description}</p>}
                {proj.details.length > 0 && (
                  <ul className="list-inside list-disc opacity-90">
                    {proj.details.map((detail, index) => (
                      <li key={index} className="pl-2">
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {(data.skills.languages || data.skills.frameworks || data.skills.tools || data.skills.other) && (
        <section className={spacing}>
          <h2 className={`mb-2 border-b-2 ${colors.border} pb-1 text-lg font-bold uppercase tracking-wider ${colors.heading}`}>
            Skills
          </h2>
          <div className="space-y-1 opacity-90">
            {data.skills.languages && <div><span className="font-bold">Languages:</span> {data.skills.languages}</div>}
            {data.skills.frameworks && <div><span className="font-bold">Frameworks:</span> {data.skills.frameworks}</div>}
            {data.skills.tools && <div><span className="font-bold">Tools:</span> {data.skills.tools}</div>}
            {data.skills.other && <div><span className="font-bold">Other:</span> {data.skills.other}</div>}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <section className={spacing}>
          <h2 className={`mb-2 border-b-2 ${colors.border} pb-1 text-lg font-bold uppercase tracking-wider ${colors.heading}`}>
            Certifications
          </h2>
          <div className={spacing}>
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <div>
                  <span className="font-bold">{cert.name}</span>
                  {cert.issuer && <span className="opacity-90">, {cert.issuer}</span>}
                </div>
                <div className="opacity-70">{cert.date}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
