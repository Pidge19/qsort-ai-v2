window.QSORT_CONFIG = {
  study: {
    title: "AI + Q Methodology Q-sort",
    version: "v2"
  },

  instructions: {
    standard: "You will sort 40 statements into a forced distribution grid from +4 to −4.",
    simplified: "You will sort 40 statements into a grid from +4 (most like you) to −4 (least like you)."
  },

  ethics: {
    approvalRef: "ETHICS APPROVAL PENDING",
    infoSheetPdfUrl: "LINK_TO_PDF_TBC",
    infoSheetWebUrl: "LINK_TO_WEB_TBC"
  },

  researchBlurbHtml: `
    <h3>About this project</h3>
    <p>Hi! I’m Desley, and I’m doing a research project about AI and its use with Q Methodology. I’m hoping to learn from real student experiences so we can improve training and support in the future.</p>

    <h3>What you’ll be asked to do</h3>
    <p>If you choose to take part, you’ll be asked to sort through 40 statements. There are no right or wrong answers. I’m interested in your honest thoughts.</p>

    <h3>Your choice, your control</h3>
    <p>Taking part is completely voluntary. You can say no, or you can start and later decide to stop. Nothing you say will affect your course, grades, or training in any way.</p>

    <h3>Your privacy matters</h3>
    <p>Anything you share will be kept private. Your name won’t appear in any reports, and only the research team will see your responses. Everything is stored safely and used only for this project.</p>

    <h3>Any risks or benefits?</h3>
    <p>There aren’t any expected risks. You won’t get something directly out of it, but your input could help improve how future students learn and train.</p>

    <h3>Questions? Want to know more?</h3>
    <p>You’re welcome to ask me anything before, during, or after participating.</p>
    <p><b>Contact:</b><br/>Desley Pidgeon<br/>Email: [insert email]</p>
  `,

  // Pre-sort questions (all optional)
  preSortQuestions: [
    { id: "role", type: "select", label: "Which best describes your current role?", options: ["Researcher", "Higher education academic", "Student (HDR)", "Student (coursework)", "Industry practitioner", "Policy or government", "Other"] },
    { id: "q_experience", type: "scale", label: "How familiar are you with Q methodology?", min: 1, max: 6, anchors: ["Not at all familiar", "Very familiar"] },
    { id: "ai_experience", type: "scale", label: "How experienced are you with using AI tools (e.g. ChatGPT, Copilot) in your work or study?", min: 1, max: 6, anchors: ["No experience", "Extensive experience"] },
    { id: "age_bracket", type: "select", label: "Which age range do you fall into?", options: ["Under 25", "25–34", "35–44", "45–54", "55–64", "65 or over", "Prefer not to say"] },
    { id: "gender", type: "select", label: "What is your gender?", options: ["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"] },
    { id: "gender_self", type: "text", label: "If you chose “Prefer to self-describe”, please describe (optional)" },
    { id: "nationality", type: "text", label: "What is your nationality? (optional)" },
    { id: "first_language", type: "text", label: "What is your first language? (optional)" },
    { id: "interface_language", type: "select", label: "How would you prefer the study instructions to be presented?", options: ["Standard English", "Simplified English"] },
    { id: "context_notes", type: "textarea", label: "Is there anything you would like us to keep in mind as you complete the Q-sort? (optional)", placeholder: "Optional" }
  ],

  // Forced distribution
  scale: [4,3,2,1,0,-1,-2,-3,-4],
  slots: {"4":2,"3":4,"2":6,"1":8,"0":10,"-1":8,"-2":6,"-3":4,"-4":2},

  // Statements (keep your 40 from v1; paste yours here)
  statements: [
    { num: 1, text: "AI can dramatically speed up building a concourse without reducing the quality of a Q study." },
    { num: 2, text: "Using AI to draft candidate statements is a smart way to avoid missing important viewpoints in the concourse." },
    { num: 3, text: "AI is most useful in Q studies when it handles routine tasks so the researcher can focus on interpretation." },
    { num: 4, text: "AI helps me write clearer, more accessible Q statements without changing their meaning." },
    { num: 5, text: "AI makes Q research more feasible when time, staffing, or budgets are limited." },
    { num: 6, text: "AI is valuable because it can quickly summarise large bodies of text into themes I can mine for statements." },
    { num: 7, text: "AI can improve participant experience by making Q-sort instructions clearer and less intimidating." },
    { num: 8, text: "AI is best seen as a research assistant that extends my capacity rather than replacing my expertise." },
    { num: 9, text: "AI can help me identify overlap and redundancy in a draft Q-set faster than manual checking." },
    { num: 10, text: "AI is helpful because it can propose alternative phrasings that keep statements neutral and sortable." },
    { num: 11, text: "Using AI to generate concourse material fits well with concourse theory because it expands communications on a topic." },
    { num: 12, text: "AI-generated text is fine for a concourse, as long as I mine and reshape it into subjective statements." },
    { num: 13, text: "AI makes it easier to create a diverse concourse, but it still takes expert judgement to keep it balanced." },
    { num: 14, text: "AI is useful for Q-sample selection when I use it alongside a structured framework rather than random picking." },
    { num: 15, text: "I trust Q results more when AI is used only in statement development—not in factor interpretation." },
    { num: 16, text: "AI can support the post-sort interview stage by summarising transcripts, but I must validate the meaning myself." },
    { num: 17, text: "AI is helpful for creating multiple versions of the same statement (plain language, culturally appropriate, etc.)." },
    { num: 18, text: "AI encourages better documentation in Q studies because it can support audit trails and decision logs." },
    { num: 19, text: "AI should be used to support Q-technique (data collection steps) more than Q-method (interpretation)." },
    { num: 20, text: "AI can improve the transparency of a Q study by helping write clearer methods sections." },
    { num: 21, text: "AI risks narrowing the concourse if it reflects only what it was trained on rather than local or marginal voices." },
    { num: 22, text: "I worry that AI will quietly introduce bias into the wording of Q statements unless I check carefully." },
    { num: 23, text: "AI outputs can sound convincing even when they are wrong, so I must verify content before using it in Q research." },
    { num: 24, text: "The more AI is used in research, the more important it becomes to disclose exactly how it was used." },
    { num: 25, text: "Using AI in Q research raises privacy and data-security concerns that are easy to underestimate." },
    { num: 26, text: "AI can create extra verification workload, so efficiency gains are sometimes overstated." },
    { num: 27, text: "I worry that AI encourages generic statements that weaken the discriminating power of a Q-set." },
    { num: 28, text: "AI should never be used to decide what a factor means without human interpretation." },
    { num: 29, text: "Because AI can reinforce bias, I treat AI-generated concourse material as provisional." },
    { num: 30, text: "If participants distrust AI, using it in the research process could reduce engagement and data quality." },
    { num: 31, text: "Researchers need training to use AI well; otherwise AI may worsen rather than improve research quality." },
    { num: 32, text: "AI is only useful if researchers can write strong prompts and refine them iteratively." },
    { num: 33, text: "AI encourages better reflexivity because it can challenge my assumptions and suggest alternatives." },
    { num: 34, text: "AI can make Q studies more inclusive by supporting translation and accessibility for diverse participants." },
    { num: 35, text: "There should be agreed guidelines in my team about when AI is appropriate in Q studies and when it isn’t." },
    { num: 36, text: "I prefer AI use that strengthens participant voice rather than replacing it." },
    { num: 37, text: "AI can support learning and confidence by providing fast feedback—but overreliance can weaken researcher judgement." },
    { num: 38, text: "AI should be evaluated like any tool: by whether it strengthens rigour and trustworthiness." },
    { num: 39, text: "I’m comfortable using AI for drafting and editing, but uncomfortable using it for analytical decisions." },
    { num: 40, text: "The best Q studies will blend AI support with strong human interpretive work—not treat AI as an authority." }
  ],

  // Participant ID behaviour
  pidQueryParam: "pid",
  autoPidPrefix: "Q",
  autoPidLength: 10,

  // Submission endpoint
  powerAutomateUrl: "https://defaultfdade0c43fea4320ae531a1742aeff.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6631c392263745a682144d9b31ae6ac5/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=P4spN2yBidH_tg6bNa7ebxpiHVxRj2V2Qj1LTOzqqKM"
};
