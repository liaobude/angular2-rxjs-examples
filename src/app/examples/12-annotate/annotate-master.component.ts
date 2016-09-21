import { Component, OnInit } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/pairwise';

@Component({
  selector: 'app-annotate-master',
  template: `
    <app-line [line]="emptyLine"></app-line>
    <app-line
      *ngFor="let line of lines" [line]="line">
    </app-line>
  `
})
export class AnnotateMasterComponent implements OnInit {
  lines: any[] = [];
  emptyLine: any = { x1: 0, y1: 0, x2: 0, y2: 0 };

  constructor(private af: AngularFire) {}

  ngOnInit() {
    const remote$ = this.af.database.object('annotate/');
    Observable.fromEvent(document, 'mousemove')
      .map(event => {
        const offset = $(event.target).offset();
        console.log('TARGET: ', event.target);
        console.log('OFFSET: ', $(event.target).offset());

        return {
          x: event.clientX - offset.left,
          y: event.clientY - offset.top
        };
      })
      .pairwise(2)
      .map(positions => {
        const p1 = positions[0];
        const p2 = positions[1];
        return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      })
      .do(event => remote$.update(event))
      .subscribe(line => {
        this.lines = [...this.lines, line];
      });
  }
}
