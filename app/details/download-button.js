import { LitElement, html, css } from 'lit-element';
import { styles } from 'wgnhs-common';

/**
 * https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
 * @param {*} a 
 * @param {*} b 
 * @param {*} c 
 * @param {*} d 
 * @param {*} e 
 */
const fileSizeIEC = function(a,b,c,d,e){
  return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(0)
  +' '+(e?'KMGTPEZY'[--e]+'B':'Bytes')
 }

export class DownloadButton extends LitElement {
  static get properties() {
    return {
      src: {
        type: String
      },
      exists: {
        type: Boolean,
        attribute: false
      },
      fileSize: {
        type: String,
        attribute: false
      }
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return [
      ...styles,
      css`
      [data-closed] {
        display: none;
      }
      .file-size {
        font-size: var(--font-size-small);
      }
    `];
  }

  render() {
    return html`
    <button-link href="${this.src}" target="_blank" download ?data-closed="${!this.exists}">
      <i slot="content-before" class="material-icons" title="Download">save_alt</i>
      <span slot="content"><slot>Download</slot></span>
      <span slot="content-after" class="file-size">${this.fileSize}</span>
    </button-link>
    `;
  }

  updated(prev) {
    if (prev.has('src') && this.src) {
      this.exists = false;
      fetch(
        this.src, 
        {method: 'HEAD'}
        ).then(resp => {
          if (resp.ok) {
            this.exists = true;
            let bytes = resp.headers.get('Content-Length');
            if (bytes) {
              this.fileSize = fileSizeIEC(bytes);
            }
          }
        })
    }
  }
}
customElements.define('download-button', DownloadButton);