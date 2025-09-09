import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    {title: 'Resumind | Review'},
    {name: 'description', content: 'A detailed overview of your resume'},
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            // Get access to all resume data
            const resume = await kv.get(`resume:${id}`);

            // Exit function if no access to resume
            if(!resume) return;

            // Parse and read data
            const data = JSON.parse(resume);
            console.log(data);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
            const resumeUrl = URL.createObjectURL(pdfBlob);

            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;

            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            // Transform the flat feedback data to match your interface
            const transformedFeedback = {
                overall_rating: data.feedback.overall_rating || 0,
                ATS: {
                    ats_compatibility: data.feedback.ats_compatibility || 0,
                    tips: (data.feedback.improvement_suggestions || []).map((suggestion: string) => ({
                        type: "improve" as const,
                        tip: suggestion
                    }))
                },
                toneAndStyle: {
                    score: data.feedback.format_and_design || 0,
                    tips: [
                        ...(data.feedback.strengths || []).slice(0, 3).map((strength: string) => ({
                            type: "good" as const,
                            tip: strength,
                            explanation: "This demonstrates good tone and style in your resume."
                        })),
                        ...(data.feedback.areas_of_concern || []).slice(0, 2).map((concern: string) => ({
                            type: "improve" as const,
                            tip: concern,
                            explanation: "Consider addressing this to improve your resume's tone and style."
                        }))
                    ]
                },
                content: {
                    score: data.feedback.content_quality || 0,
                    tips: (data.feedback.improvement_suggestions || []).slice(0, 4).map((suggestion: string) => ({
                        type: "improve" as const,
                        tip: suggestion,
                        explanation: "This will help improve your content quality and relevance."
                    }))
                },
                structure: {
                    score: data.feedback.format_and_design || 0,
                    tips: (data.feedback.strengths || [])
                        .filter((s: string) => s.toLowerCase().includes('format') || s.toLowerCase().includes('organize'))
                        .map((strength: string) => ({
                            type: "good" as const,
                            tip: strength,
                            explanation: "This shows good structural elements in your resume."
                        }))
                },
                skills: {
                    score: data.feedback.relevance_to_position || 0,
                    tips: (data.feedback.areas_of_concern || [])
                        .filter((c: string) => c.toLowerCase().includes('skill') || c.toLowerCase().includes('experience'))
                        .map((concern: string) => ({
                            type: "improve" as const,
                            tip: concern,
                            explanation: "Focus on highlighting these skills more effectively."
                        }))
                }
            };

            setFeedback(transformedFeedback);
            console.log({resumeUrl, imageUrl, feedback: transformedFeedback});
        }

        loadResume();
    }, [id])

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg'] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                    alt="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            {feedback ? (
                                <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                                    <Summary feedback={feedback} />
                                    <ATS score={feedback.ATS.ats_compatibility || 0} suggestions={feedback.ATS.tips || []} />
                                    <Details feedback={feedback} />
                                </div>
                            ) : (
                                <img src="/images/resume-scan-2.gif" alt="Scanning your resume" className="w-full" />
                            )}
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" alt="Scanning your resume" className="w-full" />
                    )}
                </section>
            </div>

        </main>
    )
}

export default Resume;