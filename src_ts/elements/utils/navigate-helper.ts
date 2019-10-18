export function navigateToUrl(url: string) {
  if (!url) {
    return;
  }
  window.history.pushState(window.history.state, '', url);
  window.dispatchEvent(new CustomEvent('location-changed'));
}
