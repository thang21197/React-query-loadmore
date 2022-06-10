import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider
} from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

function Example() {
  const { ref, inView } = useInView();
  const [page, setPage] = useState(1);

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage
  } = useInfiniteQuery(
    "projects",
    async ({ pageParam = { page: page, limit: 50 } }) => {
      const { page, limit } = pageParam;
      const res = await axios.get(
        `https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=${limit}`
      );
      return res.data;
    },
    {
      getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
      getNextPageParam: (lastPage) => {
        return lastPage.length > 0 ? { page: page + 1, limit: 50 } : undefined;
      }
    }
  );

  React.useEffect(() => {
    if (inView) {
      fetchNextPage();
      setPage(page + 1);
    }
  }, [inView]);

  return (
    <div>
      <h1>Infinite Loading</h1>
      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          <div>
            <button
              onClick={() => fetchPreviousPage()}
              disabled={!hasPreviousPage || isFetchingPreviousPage}
            >
              {isFetchingPreviousPage
                ? "Loading more..."
                : hasPreviousPage
                ? "Load Older"
                : "Nothing more to load"}
            </button>
          </div>
          {data?.pages &&
            data?.pages?.map((page, index) => {
              return (
                <React.Fragment key={index}>
                  {page?.map((todo) => (
                    <p
                      style={{
                        border: "1px solid gray",
                        borderRadius: "5px",
                        padding: "10rem 1rem",
                        background: `hsla(${todo.id * 30}, 60%, 80%, 1)`
                      }}
                      key={todo?.id}
                    >
                      {todo?.id}
                      {todo?.title}
                    </p>
                  ))}
                </React.Fragment>
              );
            })}
          <div>
            <button
              ref={ref}
              onClick={() => fetchNextPage({ page: 2, limit: 5 })}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load Newer"
                : "Nothing more to load"}
            </button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? "Background Updating..."
              : null}
          </div>
        </>
      )}
      <hr />
      <Link href="/about">
        <a>Go to another page</a>
      </Link>
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
}
