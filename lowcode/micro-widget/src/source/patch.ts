import globalEnv from '../libs/global-env';

function patchDocument() {
  const {
    rawDocument,
    rawRootDocument,
    rawCreateElement,
    rawCreateElementNS,
    rawCreateDocumentFragment,
    rawCreateComment,
    rawQuerySelector,
    rawQuerySelectorAll,
  } = globalEnv;

  function isProxyDocument(target: unknown): target is Document {
    return toString.call(target) === '[object ProxyDocument]';
  }

  function getBindTarget(target: Document): Document {
    return isProxyDocument(target) ? rawDocument : target;
  }

  rawRootDocument.prototype.createElement = function (tagName: string, options?: ElementCreationOptions): HTMLElement {
    return rawCreateElement.call(getBindTarget(this), tagName, options);
  };

  rawRootDocument.prototype.createElementNS = function (
    namespaceURI: string,
    name: string,
    options?: string | ElementCreationOptions,
  ): any {
    return rawCreateElementNS.call(getBindTarget(this), namespaceURI, name, options);
  };

  rawRootDocument.prototype.createDocumentFragment = function (): DocumentFragment {
    return rawCreateDocumentFragment.call(getBindTarget(this));
  };

  rawRootDocument.prototype.createComment = function (data: string): Comment {
    return rawCreateComment.call(getBindTarget(this), data);
  };

  rawRootDocument.prototype.querySelector = function (selector: string): any {
    return rawQuerySelector.call(getBindTarget(this), selector);
  };

  rawRootDocument.prototype.querySelectorAll = function (selector: string): any {
    rawQuerySelectorAll.call(getBindTarget(this), selector);
  };

  rawRootDocument.prototype.getElementById = function () {};

  rawRootDocument.prototype.getElementsByClassName = function () {};

  rawRootDocument.prototype.getElementsByTagName = function () {};

  rawRootDocument.prototype.getElementsByName = function () {};
}

export function patchElementAndDocument(): void {
  patchDocument();
}
