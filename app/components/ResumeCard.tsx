import React, {useEffect, useState} from 'react';
import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {usePuterStore} from "~/lib/puter";
import Resume from "~/routes/resume";
import resume from "~/routes/resume";

const ResumeCard = ({resume: {id, companyName, jobTitle, feedback, imagePath }}: {resume: Resume}) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState("");

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);

            setResumeUrl(url);
        }
        loadResume();
    }, [imagePath]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-300">
            <div className="resume-card-header">
            <div className="flex flex-col gap-2">
                {/* Allow user to upload just their resume for analysis */}
                {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
            </div>
            <div className="flex-shrink-0">
                <ScoreCircle score={feedback.overall_rating} />
            </div>
            </div>

            {/* Resume Images - Show below titles and scores
               Only render this component is a resume URL exists
             */}
            {resumeUrl && (
            <div className="gradient-border animate-in  fade-in duration-100">
                <div className="w-full h-full">
                    <img src={resumeUrl} alt="resume" className="w-full h-[350px] max-sm:h:h-[200px] object-cover object-top" />
                </div>
            </div>
            )}
        </Link>
    )
}

export default ResumeCard;