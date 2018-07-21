import { render, unmountComponentAtNode } from 'react-dom';
import { Renderer } from '../../types';

export function createDOMRenderer(container: Element): Renderer {
  return (element) => {
    render(element, container);

    return {
      unmount() {
        unmountComponentAtNode(container);
      },
    };
  };
}
