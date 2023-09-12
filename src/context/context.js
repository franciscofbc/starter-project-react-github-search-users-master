import React, { useState, useEffect, useContext } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';
import { createContext } from 'react';

const rootUrl = 'https://api.github.com';

const GithubContext = createContext();
export const useGithubContext = () => useContext(GithubContext);

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: '' });

  const searchGithubUser = async (user) => {
    toggleError();
    setIsLoading(true);

    try {
      const response = await axios.get(`${rootUrl}/users/${user}`);
      setGithubUser(response.data);
      //repos and followers
      const { login, followers_url, repos_url } = response.data;
      await Promise.allSettled([
        axios.get(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios.get(`${followers_url}?per_page=100`),
      ])
        .then((results) => {
          const [repos, followers] = results;
          const status = 'fulfilled';
          if (repos.status === status) {
            setRepos(repos.value.data);
          }
          if (followers.status === status) {
            setFollowers(followers.value.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
      toggleError(true, 'there is no user with that username');
    }

    checkRequests();
    setIsLoading(false);
  };

  const checkRequests = async () => {
    try {
      const response = await axios.get(`${rootUrl}/rate_limit`);
      let { remaining } = response.data.rate;
      setRequests(remaining);
      if (remaining === 0) {
        toggleError(true, 'you exceeded your hourly rate limit');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleError = (show = false, msg = '') => {
    setError({ show, msg });
  };

  useEffect(() => {
    checkRequests();
  }, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubProvider;
