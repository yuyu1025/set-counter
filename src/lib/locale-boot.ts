export const LOCALE_STORAGE_KEY = "sets.locale";

export const LOCALE_BOOT_SCRIPT = `(()=>{try{var k=${JSON.stringify(
  LOCALE_STORAGE_KEY,
)};var s=localStorage.getItem(k);var lang;if(s==="zh"||s==="en"){lang=s}else{var nav=[];if(typeof navigator!=="undefined"){if(navigator.languages&&navigator.languages.length){nav=navigator.languages}else if(navigator.language){nav=[navigator.language]}}lang=nav.some(function(l){return String(l).toLowerCase().indexOf("zh")===0})?"zh":"en"}document.documentElement.lang=lang==="zh"?"zh-CN":"en";document.documentElement.dataset.locale=lang}catch(e){document.documentElement.lang="en";document.documentElement.dataset.locale="en"}})();`;
