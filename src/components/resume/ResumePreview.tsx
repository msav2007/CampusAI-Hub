import type { ResumeData } from "@/lib/resume/types";

export function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div
      className="mx-auto bg-white p-8 text-black shadow-lg"
      style={{ width: "210mm", minHeight: "297mm", boxSizing: "border-box" }}
    >
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wider">
          {data.personalInfo.fullName}
        </h1>
        <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.email && data.personalInfo.phone && <span>|</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.phone && data.personalInfo.location && <span>|</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
          {data.personalInfo.linkedinUrl && (
            <a
              href={`https://${data.personalInfo.linkedinUrl}`}
              className="text-blue-600 hover:underline"
            >
              {data.personalInfo.linkedinUrl}
            </a>
          )}
          {data.personalInfo.linkedinUrl && data.personalInfo.githubUrl && <span>|</span>}
          {data.personalInfo.githubUrl && (
            <a
              href={`https://${data.personalInfo.githubUrl}`}
              className="text-blue-600 hover:underline"
            >
              {data.personalInfo.githubUrl}
            </a>
          )}
          {data.personalInfo.githubUrl && data.personalInfo.portfolioUrl && <span>|</span>}
          {data.personalInfo.portfolioUrl && (
            <a
              href={`https://${data.personalInfo.portfolioUrl}`}
              className="text-blue-600 hover:underline"
            >
              {data.personalInfo.portfolioUrl}
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-4">
          <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 border-b-2 border-gray-300 pb-1 text-lg font-bold uppercase tracking-wider text-gray-800">
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold">
                  <span>{exp.company}</span>
                  <span className="font-normal text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between text-sm italic">
                  <span>{exp.role}</span>
                  <span>{exp.location}</span>
                </div>
                {exp.details.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm">
                    {exp.details.map((detail, index) => (
                      <li key={index} className="pl-2 leading-relaxed">
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
        <section className="mb-4">
          <h2 className="mb-2 border-b-2 border-gray-300 pb-1 text-lg font-bold uppercase tracking-wider text-gray-800">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between font-bold">
                  <span>{edu.institution}</span>
                  <span className="font-normal text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <div className="flex justify-between text-sm italic">
                  <span>
                    {edu.degree} in {edu.field}
                  </span>
                  <span>{edu.score}</span>
                </div>
                {edu.details.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {edu.details.map((detail, index) => (
                      <li key={index} className="pl-2 leading-relaxed">
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
        <section className="mb-4">
          <h2 className="mb-2 border-b-2 border-gray-300 pb-1 text-lg font-bold uppercase tracking-wider text-gray-800">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span>{proj.name}</span>
                    {proj.link && (
                      <a
                        href={`https://${proj.link}`}
                        className="text-xs font-normal text-blue-600 hover:underline"
                      >
                        {proj.link}
                      </a>
                    )}
                  </div>
                  {proj.technologies && (
                    <span className="text-sm font-normal text-gray-600">{proj.technologies}</span>
                  )}
                </div>
                {proj.description && <p className="mt-1 text-sm italic">{proj.description}</p>}
                {proj.details.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {proj.details.map((detail, index) => (
                      <li key={index} className="pl-2 leading-relaxed">
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
      {(data.skills.languages ||
        data.skills.frameworks ||
        data.skills.tools ||
        data.skills.other) && (
        <section className="mb-4">
          <h2 className="mb-2 border-b-2 border-gray-300 pb-1 text-lg font-bold uppercase tracking-wider text-gray-800">
            Skills
          </h2>
          <div className="space-y-1 text-sm">
            {data.skills.languages && (
              <div>
                <span className="font-bold">Languages:</span> {data.skills.languages}
              </div>
            )}
            {data.skills.frameworks && (
              <div>
                <span className="font-bold">Frameworks:</span> {data.skills.frameworks}
              </div>
            )}
            {data.skills.tools && (
              <div>
                <span className="font-bold">Tools:</span> {data.skills.tools}
              </div>
            )}
            {data.skills.other && (
              <div>
                <span className="font-bold">Other:</span> {data.skills.other}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 border-b-2 border-gray-300 pb-1 text-lg font-bold uppercase tracking-wider text-gray-800">
            Certifications
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between text-sm">
                <div>
                  <span className="font-bold">{cert.name}</span>
                  {cert.issuer && <span>, {cert.issuer}</span>}
                </div>
                <div className="text-gray-600">{cert.date}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
