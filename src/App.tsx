import { FormEventHandler, useCallback, useMemo } from "react";
import { useEffect, useState } from "react";
import Page from "./components/page/Page";

function App() {
  const [timeUntil, setTimeUntil] = useState("");

  const urlData = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const waitData = searchParams.get('wait');
    if (waitData) {
      try {
        return JSON.parse(atob(waitData));
      } catch (e) {
        console.error("Failed to parse wait data:", e);
      }
    }
    return null;
  }, [])

  useEffect(() => {
    if (!urlData || !urlData.date || !urlData.time) {
      return;
    }
    let frameId: number;
    const target = new Date(`${urlData.date}T${urlData.time}`);
    const update = () => {
      const now = new Date();
      let newTimeUntil = "";
      if (!isNaN(target.getTime())) {
        const diffMs = target.getTime() - now.getTime();
        if (diffMs > 0) {
          const diffSec = Math.floor(diffMs / 1000);
          const days = Math.floor(diffSec / (3600 * 24));
          const hours = Math.floor((diffSec % (3600 * 24)) / 3600);
          const minutes = Math.floor((diffSec % 3600) / 60);
          const seconds = diffSec % 60;
          newTimeUntil = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeUntil = "Goal time reached!";
        }
      } else {
        newTimeUntil = "Invalid date/time";
      }
      setTimeUntil(newTimeUntil);
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frameId);
  }, [urlData?.date, urlData?.time]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const what = (form.elements.namedItem("what") as HTMLInputElement).value;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;
    const time = (form.elements.namedItem("time") as HTMLInputElement).value;

    const data = { what, date, time }
    const urlData = btoa(JSON.stringify(data));

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('wait', urlData);
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, []);

  if (urlData) {
    return (
      <Page name="Time Until">
        <hgroup>
          <h2>{urlData.what} - {timeUntil}</h2>
          <p>{urlData.date} @ {urlData.time}</p>
        </hgroup>
      </Page>
    );
  }

  return (
    <Page name="Time Until">
      <form onSubmit={handleSubmit}>
        <input placeholder="What thing are you waiting for?" name="what" required />
        <fieldset role="group" style={{ alignItems: "baseline", gap: "0.5em" }}>
          <h2>on</h2>
          <input type="date" name="date" required />
          <h2>at</h2>
          <input type="time" name="time" required />
        </fieldset>
        <button type="submit">Start</button>
      </form>
    </Page>
  );
}

export default App;
