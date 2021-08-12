import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import pgsql from "react-syntax-highlighter/dist/esm/languages/hljs/pgsql";
import xcode from "react-syntax-highlighter/dist/esm/styles/hljs/xcode";
import { TabbedViewContainer } from "pages/Editor/APIEditor/Form";
import { TabComponent } from "components/ads/Tabs";
import {
  EditorModes,
  EditorSize,
  EditorTheme,
  TabBehaviour,
} from "../CodeEditor/EditorConfig";
import CodeEditor from "../CodeEditor";
import Button, { Size } from "components/ads/Button";
import { evaluateSnippet } from "actions/globalSearchActions";
import { useSelector } from "store";
import { AppState } from "reducers";
import ReadOnlyEditor from "../ReadOnlyEditor";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("postgres", pgsql);

const SnippetContainer = styled.div`
  display: flex;
  flex-direction: column;
  .snippet-title {
    color: #090707;
    font-size: 17px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    .action-msg {
      color: #a9a7a7;
      font-size: 11px;
      font-weight: 400;
      flex-shrink: 0;
    }
  }
  .snippet-desc {
    color: #4b4848;
    font-size: 14px;
    font-weight: 400;
    margin: 10px 0;
  }
  .snippet-group {
    margin: 5px 0;
    .header {
      font-weight: 500;
      font-size: 14px;
    }
    .content {
      font-weight: 400;
      font-size: 14px;
    }
    .argument {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      margin: 5px 0;
      .args-dropdown {
        box-shadow: none;
        background-color: ${(props) => props.theme.colors.propertyPane.bg};
        border: none;
      }
    }
  }
  .tab-container {
    border-top: none;
    .react-tabs__tab-panel {
      background: white !important;
      height: auto !important;
      overflow: hidden;
      margin-top: 2px;
      border-top: 1px solid #f0f0f0;
      .actions-container {
        display: flex;
        margin: 15px 0;
        button {
          margin-right: 5px;
        }
        .copy-snippet-btn {
          border: 2px solid #a9a7a7;
          color: #a9a7a7;
          background: white;
        }
      }
    }
    .react-tabs__tab-list {
      background: white !important;
      padding: 0 10px !important;
      color: #a9a7a7 !important;
      .react-tabs__tab--selected {
        color: #f86a2b;
      }
    }
  }
`;

function getSnippet(snippet: string, args: any) {
  const regex = /\${(.*?)}/g;
  return snippet.replace(regex, function(match, capture) {
    const substitution = args[capture] || "";
    if (substitution.startsWith("{{") && substitution.endsWith("}}")) {
      return substitution.substring(2, substitution.length - 2);
    }
    return substitution || capture;
  });
}

export default function SnippetDescription(props: any) {
  const {
    item: {
      body: { additionalInfo, args, examples, snippet, summary, title },
      language,
      returnType,
    },
  } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedArgs, setSelectedArgs] = useState<any>({});
  const dispatch = useDispatch();
  const evaluatedSnippet = useSelector(
    (state: AppState) => state.ui.globalSearch.filterContext.evaluatedSnippet,
  );
  return (
    <SnippetContainer>
      <div className="snippet-title">
        <span>{title}</span>
        <span className="action-msg">Hit ⏎ to insert</span>
      </div>
      <div className="snippet-desc">{summary}</div>
      <TabbedViewContainer className="tab-container">
        <TabComponent
          onSelect={setSelectedIndex}
          selectedIndex={selectedIndex}
          tabs={[
            {
              key: "Snippet",
              title: "Snippet",
              panelComponent: (
                <>
                  <SyntaxHighlighter language={language} style={xcode}>
                    {getSnippet(snippet, selectedArgs)}
                  </SyntaxHighlighter>
                  {examples && examples.length ? (
                    <div className="snippet-group">
                      <div className="header">Example</div>
                      <div className="content">
                        {examples.map((ex: any) => (
                          <>
                            <p>{ex.title}</p>
                            <SyntaxHighlighter
                              language={language}
                              style={xcode}
                            >
                              {ex.code}
                            </SyntaxHighlighter>
                            <p>{ex.summary}</p>
                          </>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}
                </>
              ),
            },
            {
              key: "Customize",
              title: "Customize",
              panelComponent:
                args && args.length > 0 ? (
                  <>
                    <SyntaxHighlighter language={language} style={xcode}>
                      {getSnippet(snippet, selectedArgs)}
                    </SyntaxHighlighter>
                    <div className="snippet-group">
                      {args.map((arg: any) => (
                        <div className="argument" key={arg.name}>
                          <span>{arg.name}</span>
                          <CodeEditor
                            expected={arg.type}
                            hideEvaluatedValue
                            input={{
                              value: selectedArgs[arg.name],
                              onChange: (value: any) => {
                                setSelectedArgs({
                                  ...selectedArgs,
                                  [arg.name]: value,
                                });
                              },
                            }}
                            mode={EditorModes.TEXT_WITH_BINDING}
                            showLightningMenu={false}
                            size={EditorSize.EXTENDED}
                            tabBehaviour={TabBehaviour.INDENT}
                            theme={EditorTheme.LIGHT}
                          />
                        </div>
                      ))}
                      <div className="actions-container">
                        <Button
                          className="t--apiFormRunBtn"
                          onClick={() => {
                            dispatch(
                              evaluateSnippet({
                                expression: getSnippet(snippet, selectedArgs),
                                dataType: returnType,
                              }),
                            );
                          }}
                          size={Size.medium}
                          tag="button"
                          text="Run"
                          type="button"
                        />
                        <Button
                          className="copy-snippet-btn"
                          onClick={() => {
                            console.log();
                          }}
                          size={Size.medium}
                          tag="button"
                          text="Copy Snippet"
                          type="button"
                        />
                      </div>
                      {evaluatedSnippet && (
                        <div className="snippet-group">
                          <div className="header">Evaluated Snippet</div>
                          <div className="content">
                            <ReadOnlyEditor
                              folding
                              height="300px"
                              input={{ value: evaluatedSnippet }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div />
                ),
            },
          ]}
        />
      </TabbedViewContainer>
      {additionalInfo &&
        additionalInfo.map(
          ({ content, header }: { header: string; content: string }) => (
            <div className="snippet-group" key={header}>
              <div className="header">{header}</div>
              <div className="content">{content}</div>
            </div>
          ),
        )}
    </SnippetContainer>
  );
}