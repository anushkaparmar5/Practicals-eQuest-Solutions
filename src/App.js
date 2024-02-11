import React, { useEffect, useRef, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

const Pagination = ({ hasNextPage, hasPreviousPage, onClickPrevious, onClickNext }) => {
  return (
    <div className='flex items-center justify-center gap-3'>
      <button type="button" disabled={!hasPreviousPage} onClick={onClickPrevious}>Previous Page</button>
      <button type="button" disabled={!hasNextPage} onClick={onClickNext}>Next Page</button>
    </div>
  );
};

const App = () => {
  const GET_ALL_FILMS = gql`
    query GetAllFilms($first: Int, $after: String, $before: String, $last: Int) {
      allFilms(first: $first, after: $after, before: $before, last: $last) {
        films {
          title
          director
          releaseDate
          speciesConnection {
            species {
              name
              classification
              homeworld {
                name
              }
            }
          }
        }
        totalCount  
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }        
      }
    }
  `;

  const [getData, { error, data, loading }] = useLazyQuery(GET_ALL_FILMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [pageLoading, setPageLoading] = useState(true);
  const [filmData, setFilmData] = useState([]);
  const prevPage = useRef(page);

  useEffect(() => {
    const { endCursor, startCursor } = data?.allFilms?.pageInfo || {};

    const variables = {
      first: null,
      before: null,
      after: null,
      last: null,
    };

    if (page > prevPage.current) {
      variables.first = pageSize;
      variables.after = endCursor;
    } else if (page < prevPage.current) {
      variables.last = pageSize;
      variables.before = startCursor;
    } else {
      variables.first = pageSize;
    }

    prevPage.current = page;
    getData({ variables }).then(response => {
      setPageLoading(true);
      setFilmData(response?.data?.allFilms?.films);
      setPageLoading(false);
    }).catch(error => {
      console.error("Error fetching data:", error);
      setPageLoading(false);
    });
  }, [getData, pageSize, page, data]);

  useEffect(() => {
    if (loading)
      setPageLoading(loading);
    return () => {
      setPageLoading(true);
    };
  }, [loading]);

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
  };

  if (error) {
    console.log(error.message);
    return <div>An error occurred</div>;
  }

  const filteredFilms = filmData.filter((film) =>
    film.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (pageLoading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;


  return (
    <div className='container mt-5'>
      {!pageLoading && (
        <>
          <div className='flex items-center justify-center'>
            <label className="relative block">
              <span className="sr-only">Search</span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <svg className="h-5 w-5 fill-slate-300" viewBox="0 0 20 20"></svg>
              </span>
              <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} className="placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" placeholder="Search for anything..." type="text" name="search" />
            </label>
          </div>
          <div className='flex items-center justify-center'>
            <table className="table-auto">
              <thead>
                <tr>
                  <th>Film Name</th>
                  <th>Director</th>
                  <th>Release Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredFilms.length ? filteredFilms?.map((film, index) => (
                  <tr key={index}>
                    <td>{film.title}</td>
                    <td>{film.director}</td>
                    <td>{film.releaseDate}</td>
                  </tr>
                )) :
                  <tr>
                    <td colSpan={3}>No Film Found.</td>
                  </tr>}
              </tbody>
            </table>
          </div>
          <div className='flex items-center justify-center'>
            <Pagination
              hasNextPage={data?.allFilms?.pageInfo?.hasNextPage}
              hasPreviousPage={data?.allFilms?.pageInfo?.hasPreviousPage}
              onClickNext={handleNextPage}
              onClickPrevious={handlePreviousPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
