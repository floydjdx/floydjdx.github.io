import React, { useEffect, useState } from "react";
import { HashRouter } from "react-router-dom";
import { BlogConfig } from "../blog";
import { Page, NavBar } from "./components";
import { BlogProvider, EditModeProvider, Theme } from "./state";

const IntroApp = () => {
  const [fetchData, setFetchData] = useState<any>();
  const [clientData, setClientData] = useState<any>();

  useEffect(() => {
    fetch("http://dummyjson.com/test")
      .then(res => res.json())
      .then(data => setFetchData({ data }))
      .catch(err => setFetchData({ err }));
  }, []);

  useEffect(() => {
    (window as any).getClient().then((client: any) => {
      client.getData()
        .then((data: any) => setClientData({ data }))
        .catch((err: any) => setClientData({ err }));
    });
  }, []);

  return (
    <div>
      <div>
        Fetch Result: {JSON.stringify(fetchData)}
      </div>
      <div>
        Client Result: {JSON.stringify(clientData)}
      </div>
    </div>
  );
};

interface AppProps {
  blog: BlogConfig;
}

const App: React.FC<AppProps> = ({ blog: initialBlog }) => {
  const [blog, setBlog] = useState(initialBlog);
  const [editMode, setEditMode] = useState(false);
  const [isIntroAppMode, setIsIntroAppMode] = useState(true);
  return (
    <Theme initialTheme="dark">
      <EditModeProvider value={{ editMode, setEditMode }}>
        <BlogProvider value={{ blog, setBlog }}>
          <HashRouter>
            <NavBar/>
            {
              isIntroAppMode ? (
                <div className="bg-background flex flex-column justify-center pt-4 pb-16">
                   <div>
                    <IntroApp/>
                    <button className="border p-2" onClick={(() => setIsIntroAppMode(false))}>Exit Intro App Mode</button>
                   </div>
                </div>
              ) : <Page/>
            }
          </HashRouter>
        </BlogProvider>
      </EditModeProvider>
    </Theme>
  );
};

export default App;
