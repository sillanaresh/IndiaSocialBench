export default function AboutPage() {
  return (
    <div className="prose page-intro">
      <h1>About IndiaSocialBench</h1>
      <p className="lede">
        IndiaSocialBench measures whether language models understand the emotional and social
        texture of Indian life. It evaluates conversations, not trivia about India.
      </p>
      <p>
        Frontier models top every English emotional-intelligence benchmark. Meanwhile the
        fastest-growing population of new AI users types in Hinglish, and the conversations they
        bring include a boss who can&apos;t be contradicted directly, a friend&apos;s loan that can&apos;t
        be refused outright, a rishta the family is pushing, a condolence message that must strike
        exactly the right register. These are precisely the conversations no benchmark measures.
      </p>
      <p>
        &ldquo;Set firm boundaries with your mother-in-law&rdquo; is a coherent English sentence and
        a culturally impossible action. A model that gives that advice hasn&apos;t failed at empathy;
        it has failed at <em>India</em>. That difference is measurable, and this project measures it.
      </p>
      <h2>Why it matters</h2>
      <p>
        Indic model builders train culturally grounded models but have no instrument that proves the
        cultural advantage. Enterprises deploying conversational AI to hundreds of millions of Indian
        users select vendors on latency and ASR accuracy because nobody can tell them which model
        will mishandle a grieving customer. A benchmark is the smallest product that moves both: it
        converts &ldquo;our model understands Indian users&rdquo; from a marketing claim into a
        number, a per-dimension diagnostic, and a set of receipts.
      </p>
      <h2>The author</h2>
      <p>
        Built by <strong>Naresh Silla</strong> as a product and research portfolio project: an
        exercise in finding the eval a market actually needs, then building it with the rigor the
        claim requires. The dataset, harness, scoring code, and site are open at{" "}
        <a href="https://github.com/sillanaresh/IndiaSocialBench">
          github.com/sillanaresh/IndiaSocialBench
        </a>
        .
      </p>
      <p className="small faint">
        The{" "}
        <a href="https://github.com/sillanaresh/IndiaSocialBench/blob/main/paper/DRAFT.md">
          current technical report
        </a>{" "}
        covers the method and first results. It remains provisional until human agreement is
        measured.
      </p>
    </div>
  );
}
