import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

import buildspaceLogo from "../assets/buildspace-logo.png";

const Home = () => {
  const maxRetries = 20;
  const [input, setInput] = useState("");
  const [img, setImg] = useState("");
  // Numbers of retries
  const [retry, setRetry] = useState(0);
  // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);
  // Add isGenerating state
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAction = async () => {
    console.log("Generating...");
    setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
      // Set the estimated_time property in state
      setRetry(data.estimated_time);
      setIsGenerating(false);
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      return;
    }
    setImg(data.image);
    setIsGenerating(false);
  };

  // Add useEffect here
  useEffect(() => {
    const sleep = (ms: number) => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    };

    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`
        );
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>TheAvatar | Create your own avatar</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Create your own avatar</h1>
          </div>
          <div className="header-subtitle">
            <h2>Generate upto 50 avatars of yourself using A.I</h2>
          </div>
          <div className="prompt-container">
            <input
              className="prompt-box"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
            />
            <div className="prompt-buttons">
              <a
                className={
                  isGenerating ? "generate-button loading" : "generate-button"
                }
                onClick={generateAction}
              >
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
