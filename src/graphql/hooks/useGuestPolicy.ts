import {useSubscription} from '@apollo/client';
import {GET_GUEST_WAITING_USERS_SUBSCRIPTION} from '../queries/guestSubscription';
import React, {useMemo} from 'react';

const useGuestWaitingList = () => {
  const {data, loading, error} = useSubscription(
    GET_GUEST_WAITING_USERS_SUBSCRIPTION,
  );

  const guestWaitingList = useMemo(() => {
    return {
      data: data || null,
      loading,
      error,
    };
  }, [data, loading, error]);

  return guestWaitingList;
};

export default useGuestWaitingList;
