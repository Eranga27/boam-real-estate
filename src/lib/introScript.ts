/**
 * Plain (server-safe) constants for the homepage intro, kept out of the
 * client-only intro module so the root layout can inline the head script.
 */

/** sessionStorage key: the intro plays once per browser session */
export const INTRO_SESSION_KEY = 'boam:intro-seen';

/**
 * Runs in <head> before first paint. Hides the server-rendered intro when it has
 * already played this session, and marks it as seen when the visitor lands on
 * any page other than the homepage (a later visit to "/" then skips it).
 */
export const INTRO_HEAD_SCRIPT = `try{var k='${INTRO_SESSION_KEY}';if(location.pathname!=='/'){sessionStorage.setItem(k,'done')}if(sessionStorage.getItem(k)==='done'){document.documentElement.classList.add('intro-seen')}}catch(e){}`;
