import {useState,useEffect} from 'react';

import './App.css';

import { Octokit } from "octokit";

const gitkey = process.env.REACT_APP_GIT_KEY

const octokit = new Octokit({
  auth: gitkey
});

interface Repo {
  id: number;
  name: string;
  html_url:string;
}


const Home = () => {

  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState<Repo[]>();
  const [page, setPage] = useState(1);


  const handlePrevPage = () => {
    setPage((page) => {
      if (page === 1) return page;
      else return page - 1;
    });
  };

  const handleNextPage = () => {
    setPage((page) => page + 1);
  };


  const handleQueryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

  };


  function useDebounce(value:any,delay:number){

    const [debouncedValue,setDebouncedValue] = useState(value)

    useEffect(() => {

      const handler = setTimeout(()=> {
        setDebouncedValue(value)
        setPage(1)
      },delay)

      return () => {
        clearTimeout(handler);
      }
    }, [value,delay])

    return debouncedValue;
  }

  const debouncedSearch = useDebounce(query,500);

  useEffect(() => {
    const displayReposOnChange = async () => {
      if (query) {
        const items = await fetchData();
        setRepos(items);

      }
    };
    displayReposOnChange();

  }, [page,debouncedSearch]);



  const fetchData = async () => {

    const response = await octokit.request("GET /search/repositories", {

      q: query,
      per_page: 10,
      page: page
    });
    console.log(response.data.items);
    const items = response.data.items
    setRepos(items);
    return response.data.items;

  };

  return (
      <>
      <div className="container-main">
      <h1 className="p-3 mb-2 bg-info rounded ">RepoSearch</h1>
          <div className="m-4 ">
          <input value={query} onChange={handleQueryInput } className="bg-light"type="text" size={40} style={{ height: '40px' }}/>
          </div>
      {repos ? (
      <div>
        <h3>Search results for: {query}</h3>

      </div>
    ) : (
        <></>

    )}
      <div className="pagination">
        <>
        <div className="container" >
          {repos ? (
                <>
                <div className="my-3">
              <button onClick={handlePrevPage} className="btn btn-sm btn-dark" style={{ marginRight: '10px' }}>Back</button>
              <button onClick={handleNextPage} className="btn btn-sm btn-dark"  >Next</button>
              </div>
              <div>Page:  {page}</div>
            {repos.map((repo) => {
              return <>
              <div className="row">
              <li key={repo.id}> Repo Name: {repo.name}, URL : <a target="_blank" href={repo.html_url}>{repo.html_url}</a> </li>
              </div>
              </>

            })}
            </>
          ) : (
            <h4 className="text-center">Enter your query to return repos related to your search</h4>
          )}
          </div>
        </>
      </div>
      </div>
      </>
  )
}

function App() {
  return (
    <Home/>
  );
}

export default App;
