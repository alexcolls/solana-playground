import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import styled from "styled-components";

import UploadArea from "../../../../../UploadArea";
import ModalInside from "../../../../../Modal/ModalInside";
import useModal from "../../../../../Modal/useModal";
import Input, { defaultInputProps } from "../../../../../Input";
import { explorerAtom } from "../../../../../../state";
import { Files, PgCommon, PgExplorer } from "../../../../../../utils/pg";

export const ImportFs = () => {
  const [explorer] = useAtom(explorerAtom);

  const { close } = useModal();

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle user input
  const [name, setName] = useState("");
  const [files, setFiles] = useState<Files>();
  const [filesError, setFilesError] = useState("");
  const [importError, setImportError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setImportError("");
  };

  const onDrop = useCallback(async (userFiles) => {
    try {
      const importFiles: Files = [];
      for (const userFile of userFiles) {
        let path: string = userFile.path;
        switch (path.split("/").length) {
          case 1:
            path = `${PgExplorer.PATHS.SRC_DIRNAME}/${path}`;
            break;
          case 3:
            path = path.substring(1);
            break;
          default:
            path = path.replace(/\/\w+\//, "");
        }

        if (!PgExplorer.getLanguageFromPath(path)) {
          throw new Error(`Unsupported file type (${path})`);
        }

        const arrayBuffer: ArrayBuffer = await userFile.arrayBuffer();
        if (arrayBuffer.byteLength > 1024 * 128) {
          throw new Error(
            `File '${path}' is too big.(${arrayBuffer.byteLength})`
          );
        }

        const content = PgCommon.decodeArrayBuffer(arrayBuffer);
        importFiles.push([path, content]);
      }

      setFiles(importFiles);
      setFilesError("");
    } catch (e: any) {
      setFilesError(e.message);
    }
  }, []);

  const disableCond =
    !explorer || !name || !files || !!filesError || !!importError;

  const importNewWorkspace = async () => {
    if (disableCond) return;

    try {
      await explorer.newWorkspace(name, { files });
      close();
    } catch (e: any) {
      setImportError(e.message);
    }
  };

  return (
    <ModalInside
      buttonProps={{
        name: "Import",
        onSubmit: importNewWorkspace,
        disabled: disableCond,
      }}
      closeOnSubmit={false}
    >
      <Content>
        <WorkspaceNameWrapper>
          <MainText>Project name</MainText>
          <Input
            ref={inputRef}
            onChange={handleChange}
            value={name}
            placeholder="my local project..."
            {...defaultInputProps}
          />
        </WorkspaceNameWrapper>
        <UploadArea
          onDrop={onDrop}
          error={importError || filesError}
          filesLength={files?.length}
        />
      </Content>
    </ModalInside>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 1rem;
`;

const WorkspaceNameWrapper = styled.div`
  & > input {
    font-size: ${({ theme }) => theme.font?.size.medium};
    padding: 0.375rem 0.5rem;
  }
`;

const MainText = styled.div`
  margin: 1rem 0 0.5rem 0;
  font-weight: bold;
`;
