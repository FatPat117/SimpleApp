import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { useMe } from "../features/auth/authApi";
import { logout, setAuthenticated, setUser } from "../features/auth/authSlice";
import { setProfile } from "../features/user/userSlice";

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const meQuery = useMe();

  useEffect(() => {
    if (meQuery.data) {
      dispatch(setAuthenticated({ expiresIn: 15 * 60 }));
      dispatch(setUser(meQuery.data));
      dispatch(setProfile(meQuery.data));
    }
    if (meQuery.isError) {
      dispatch(logout());
      dispatch(setProfile(null));
    }
  }, [dispatch, meQuery.data, meQuery.isError]);
}
