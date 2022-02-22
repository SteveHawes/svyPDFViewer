import { ServoyBaseComponent, WindowRefService } from '@servoy/public';
import { Component, Input, Renderer2, ChangeDetectorRef, ElementRef, SimpleChanges, ViewChild, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'pdfviewer-pdf-Viewer',
    template: `
        <div [ngClass]="styleClass" style="width:100%; height:100%" [id]="servoyApi.getMarkupId()" [sabloTabseq]="tabSeq" (focus)="onTabSequenceRequest()" #element>
                <iframe #iframe [src]="iframeURL | safe" style="width:100%; height:100%" ></iframe> 
        </div>
    `
})
export class SvyPDFViewer extends ServoyBaseComponent<HTMLDivElement> {

    @ViewChild('iframe', { read: ElementRef }) iframeElementRef: ElementRef;
    
    @Input() documentURL: string;
    @Input() noCache: boolean;
    @Input() dataProviderID: any;
    @Input() tabSeq: number;
    @Input() styleClass: string;
    @Input() visible: boolean;

    noCacheVar = "";
    documentUrlVar = "";
    iframeURL = "";

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, 
        private windowRef: WindowRefService) {
        super(renderer, cdRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes) {
            for (const property of Object.keys(changes)) {
                const change = changes[property];
                switch (property) {
                    case 'noCache':
                        this.setNoCheck();
                        break;
                    case 'documentURL':
                        this.createBaseURL();
                        break;
                    case 'dataProviderID':
                        this.createBaseURL();
                        break;
                }
            }
        }
    }

    createBaseURL() {
        this.documentUrlVar = "";
        if (this.dataProviderID && this.dataProviderID.url) {
            let serverURL = this.windowRef.nativeWindow.location.href.split('/solution/')[0];
            this.documentUrlVar += serverURL + '/' + encodeURI(this.dataProviderID.url); 
        } else if (this.documentURL) {
            // console.warn('Using documentURL is deprecated, this property is replaced for dataprovider property');
            this.documentUrlVar += this.documentURL;
        } else {
            return false;
        }    
        this.updateIframeURL([this.documentUrlVar, this.noCacheVar]); 
        return false;
    }

    setNoCheck() {
        // check for noCache and generate random http param
        if (this.noCache === true) {
            var r = Math.round(Math.random() * 10000000);
            this.noCacheVar = 'r=' + r;
        } else {
            this.noCacheVar = '';
        }
        this.updateIframeURL([this.documentUrlVar, this.noCacheVar]);
    }

    /**
     * The first parameter of the newValues array should be 'documentURL'
     * @param newValues 
    */
    updateIframeURL(newValues: any[]) {
        if(!newValues[0]) {
            return;
        }
        const url = newValues.shift();
        newValues = newValues.filter((item) => { return (item != null && item != '')});
        this.iframeURL = url + '#' + newValues.join('&');
        console.debug('Rendering iframe pdf with URL: ' + this.iframeURL);
    }

    reload() {
        setTimeout(() => {
            const url = this.iframeElementRef.nativeElement.src;
            this.renderer.setAttribute(this.iframeElementRef, 'src', 'about:blank');
            setTimeout(() => {
                this.renderer.setAttribute(this.iframeElementRef, 'src', url);
            }, 5);
        });
    }

    onTabSequenceRequest() {
        setTimeout(() => {
            this.iframeElementRef.nativeElement.contentWindow.focus();
        });
    }
}