// import { useState } from "react";
// import { toast } from "sonner";

// type FetchFunction<T> = (...args: T[]) => Promise<T>;

// interface UseFetchReturn<T> {
//   data: T | undefined;
//   loading: boolean | null;
//   error: Error | null;
//   fn: (...args: T[]) => Promise<void>;
//   setData: React.Dispatch<React.SetStateAction<T | undefined>>;
// }

// function useFetch<T>(cb: FetchFunction<T>): UseFetchReturn<T> {
//   const [data, setData] = useState<T | undefined>(undefined);
//   const [loading, setLoading] = useState<boolean | null>(null);
//   const [error, setError] = useState<Error | null>(null);

//   const fn = async (...args: T[]): Promise<void> => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await cb(...args);
//       setData(response);
//     } catch (err) {
//       const error = err as Error;
//       setError(error);
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, loading, error, fn, setData };
// }

// export default useFetch;

import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
