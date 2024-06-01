import { i18n } from "@lingui/core";
import { Trans, t } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../App.context";

import "../pico/button-group.scss";
import "../pico/property.scss";
import { TrackingDisclosure } from "../tracking";
import { getVersion, setVersion } from "../versions";
import { useDialog } from "./dialog";

const showUpgradeFs = false;

export const Settings = () => {
  const { toolStates } = useContext(AppContext);
  const { fs, setStatus, upgradeFs, closeFs, upgraded } =
    useContext(BaseContext);
  const { settings, monaco, theme, setTheme, tracking } =
    useContext(AppContext);

  const [upgrading, setUpgrading] = useState(false);

  const writeLocale = useMemo(
    () => (locale: string) => {
      i18n.activate(locale);
      fs.writeFile("/locale", locale);
    },
    [fs]
  );

  useEffect(() => {
    fs.readFile("/locale")
      .then((locale) => i18n.activate(locale))
      .catch(() => writeLocale("en"));
  }, [fs, writeLocale]);

  const resetWarning = useDialog();
  const resetConfirm = useDialog();

  const resetFiles = async () => {
    const version = getVersion();
    localStorage.clear();
    setVersion(version);
    localStorage["/chip/project"] = "01";
    localStorage["/chip/chip"] = "Not";
    const loaders = await import("@nand2tetris/projects/loader.js");
    await loaders.resetFiles(fs);
    toolStates.compiler.reset();
  };

  const loadSamples = async () => {
    const loaders = await import("@nand2tetris/projects/loader.js");
    await loaders.loadSamples(fs);
    setStatus("Loaded sample files...");
  };

  const resetWarningDialog = (
    <dialog open={resetWarning.isOpen}>
      <article>
        <main>
          <div style={{ margin: "10px" }}>
            {
              'The "reset files" action will result in erasing all the HDL files kept in your browser\'s memory, replacing them with a fresh set of skeletal HDL files. You may want to back-up your files before resetting them. Are you sure that you want to reset the files?'
            }
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "30px",
            }}
          >
            <button
              style={{ width: "100px" }}
              onClick={async () => {
                await resetFiles();
                resetWarning.close();
                resetConfirm.open();
              }}
            >
              Yes
            </button>
            <button
              style={{ width: "100px" }}
              onClick={() => {
                resetWarning.close();
              }}
            >
              Cancel
            </button>
          </div>
        </main>
      </article>
    </dialog>
  );

  const resetConfirmDialog = (
    <dialog open={resetConfirm.isOpen}>
      <article>
        <header>Your files were reset</header>
        <main>
          <button onClick={resetConfirm.close}>Ok</button>
        </main>
      </article>
    </dialog>
  );

  return (
    <>
      <dialog open={settings.isOpen}>
        <article>
          <header>
            <p>
              <Trans>Settings</Trans>
            </p>
            <a
              className="close"
              href="#root"
              onClick={(e) => {
                e.preventDefault();
                settings.close();
              }}
            />
          </header>
          <main>
            <dl>
              <header>
                <Trans>Project</Trans>
              </header>
              <dt>
                <Trans>References</Trans>
              </dt>
              <dd>
                <div>
                  <a
                    href="https://nand2tetris.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    nand2tetris.org
                  </a>
                </div>
                <div>
                  <a
                    href="https://github.com/davidsouther/nand2tetris"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              </dd>
              <dt>
                <Trans>Files</Trans>
              </dt>
              <dd>
                {showUpgradeFs && (
                  <>
                    <button
                      disabled={upgrading}
                      onClick={async () => {
                        setUpgrading(true);
                        try {
                          await upgradeFs();
                        } catch (err) {
                          console.error("Failed to upgrade FS", { err });
                          setStatus(t`Failed to load local file system.`);
                        }
                        setUpgrading(false);
                      }}
                    >
                      {!upgraded ? (
                        <Trans>Use Local FileSystem</Trans>
                      ) : (
                        <Trans>Change Local FileSystem</Trans>
                      )}
                      <Trans>Beta</Trans>
                    </button>
                    {upgraded ? (
                      <>
                        <p>
                          <Trans>Using {upgraded}</Trans>
                        </p>
                        <button
                          onClick={async () => {
                            await closeFs();
                          }}
                        >
                          Close Local FileSystem
                        </button>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                )}
                <button
                  onClick={async () => {
                    resetWarning.open();
                  }}
                >
                  <Trans>Reset</Trans>
                </button>
                <button onClick={loadSamples}>
                  <Trans>Samples</Trans>
                </button>
              </dd>
              <dt>
                <Trans>Language</Trans>
              </dt>
              <dd>
                <button onClick={() => writeLocale("en")}>
                  <Trans>English</Trans>
                </button>
                <button onClick={() => writeLocale("en-PL")}>
                  <Trans>Pseudolocale</Trans>
                </button>
              </dd>
              <dt>
                <Trans>Editor</Trans>
              </dt>
              <dd>
                <label>
                  <input
                    type="checkbox"
                    name="switch"
                    role="switch"
                    checked={monaco.wants}
                    disabled={!monaco.canUse}
                    onChange={(e) => monaco.toggle(e.target.checked)}
                  />
                  <Trans>Use Monaco Editor</Trans>
                </label>
              </dd>
              <dt>
                <Trans>Theme</Trans>
              </dt>
              <dd>
                <fieldset role="group">
                  <label role="button" aria-current={theme === "light"}>
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={theme === "light"}
                      onChange={() => setTheme("light")}
                    />
                    <Trans>Light</Trans>
                  </label>
                  <label role="button" aria-current={theme === "dark"}>
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={theme === "dark"}
                      onChange={() => setTheme("dark")}
                    />
                    <Trans>Dark</Trans>
                  </label>
                  <label role="button" aria-current={theme === "system"}>
                    <input
                      type="radio"
                      name="theme"
                      value="system"
                      checked={theme === "system"}
                      onChange={() => setTheme("system")}
                    />
                    <Trans>System</Trans>
                  </label>
                </fieldset>
              </dd>
              <dt>
                <Trans>Tracking</Trans>
              </dt>
              <dd>
                <label>
                  <input
                    type="checkbox"
                    name="switch"
                    role="switch"
                    checked={tracking.canTrack}
                    onChange={(e) => {
                      if (e.target.checked) {
                        tracking.accept();
                      } else {
                        tracking.reject();
                      }
                    }}
                  />
                  <Trans>Allow anonymous interaction tracking</Trans>
                  <TrackingDisclosure />
                </label>
              </dd>
            </dl>
          </main>
        </article>
      </dialog>
      {resetWarningDialog}
      {resetConfirmDialog}
    </>
  );
};
