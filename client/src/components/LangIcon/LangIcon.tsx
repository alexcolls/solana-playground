import { FC, useMemo } from "react";
import styled from "styled-components";

import { Lang, PgExplorer } from "../../utils/pg";
import { JavaScript, Python, QuestionMark, Rust, TypeScript } from "../Icons";

interface LangIconProps {
  fileName: string;
}

const LangIcon: FC<LangIconProps> = ({ fileName }) => {
  const Icon = useMemo(() => {
    switch (PgExplorer.getLanguageFromPath(fileName)) {
      case Lang.RUST:
        return <Rust />;
      case Lang.PYTHON:
        return <Python />;
      case Lang.JAVASCRIPT:
        return <JavaScript />;
      case Lang.TYPESCRIPT:
        return <TypeScript />;
      case Lang.JAVASCRIPT_TEST:
        return <JavaScript isTest />;
      case Lang.TYPESCRIPT_TEST:
        return <TypeScript isTest />;
      default:
        return <QuestionMark />;
    }
  }, [fileName]);

  return <Wrapper>{Icon}</Wrapper>;
};

const Wrapper = styled.div`
  width: 1rem;
  height: 1rem;

  & > svg,
  & > img {
    width: 100%;
    height: 100%;
  }
`;

export default LangIcon;
