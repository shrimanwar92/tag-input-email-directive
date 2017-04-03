import {Component, HostBinding, Input, Output, Provider, forwardRef, EventEmitter} from '@angular/core';
import { TagInputItemComponent } from './tag-input-item.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TagInputComponent),
    multi: true
};

@Component({
  selector: 'tag-input',
  template:
  `<div class="form-group" tabindex="-1">
      <div class="tags form-control">
        <div class="tag-list">
            <tag-input-item class="tag-item"
              [text]="tag"
              [index]="index"
              [selected]="selectedTag === index"
              (tagRemoved)="_removeTag($event)"
              *ngFor="let tag of tagsList; let index = index">
            </tag-input-item>
        </div>
        <input
          class="form-control input"
          type="text"
          [placeholder]="placeholder"
          [(ngModel)]="inputValue"
          (paste)="inputPaste($event)"
          (keydown)="inputChanged($event)"
          (blur)="inputBlurred($event)"
          (focus)="inputFocused()"
          #tagInputRef>
  </div>`,

  styles: [`
    .tags {
      -moz-appearance: textfield;
      -webkit-appearance: textfield;
      padding: 1px;
      overflow: hidden;
      word-wrap: break-word;
      cursor: text;
      background-color: #fff;
      border: 1px solid darkgray;
      height: 100%;
    }

    .tag-list {
      margin: 0;
      padding: 0;
      list-style-type: none;
    }

    .tag-item {
      margin: 3px;
      padding: 0 3px;
      display: inline-block;
      float: left;
      font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif;
      height: 26px;
      line-height: 25px;
      border-radius: 5px;
      margin-bottom: 3px;
    }

    .input {
      margin-bottom: -2px !important;
      margin-top: -2px;
      margin-left: -2px;
      width: 101%
    }
  `],
  directives: [TagInputItemComponent],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class TagInputComponent {
  @Input() placeholder = 'Add Email';
  @Input() ngModel;
  @Input() delimiterCode = '188';
  @Input() addOnBlur = true;
  @Input() addOnEnter = true;
  @Input() addOnPaste = true;
  @Input() allowedTagsPattern = /.+/;
  @HostBinding('class.ng2-tag-input-focus') isFocussed;

  tagsList;
  inputValue = '';
  delimiter;
  selectedTag;
  innerValue = '';
  onTouchedCallback = noop;
  onChangeCallback = noop;

  get value() {
    return this.innerValue;
  }

  set value(v) {
    if (v !== this.innerValue) {
        this.innerValue = v;
        this.onChangeCallback(v);
    }
  }

  onBlur() {
      this.onTouchedCallback();
  }

  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }

  writeValue(value) {
    if (value !== this.innerValue) {
        this.innerValue = value;
    }
  }

  constructor() {}

  ngOnInit() {
    if (this.ngModel) this.tagsList = this.ngModel;
    this.onChangeCallback(this.tagsList);
    this.delimiter = parseInt(this.delimiterCode);
  }

  ngAfterViewInit() {
    // If the user passes an undefined variable to ngModel this will warn
    // and set the value to an empty array
    if (!this.tagsList) {
      console.warn('TagInputComponent was passed an undefined value in ngModel. Please make sure the variable is defined.');
      this.tagsList = [];
      this.onChangeCallback(this.tagsList);
    }
  }

  inputChanged(event) {
    let key = event.keyCode;

    switch(key) {
      case 8: // Backspace
        this._handleBackspace();
        break;
      case 13: //Enter
        this.addOnEnter && this._addTags([this.inputValue]);
        event.preventDefault();
        break;

      case this.delimiter:
        this._addTags([this.inputValue]);
        event.preventDefault();
        break;

      default:
        this._resetSelected();
        break;
    }
  }

  inputBlurred(event) {
    this.addOnBlur && this._addTags([this.inputValue]);
    this.isFocussed = false;
  }
  inputFocused(event) {
    this.isFocussed = true;
  }

  inputPaste(event) {
    let clipboardData = event.clipboardData || (event.originalEvent && event.originalEvent.clipboardData);
    let pastedString = clipboardData.getData('text/plain');
    let tags = this._splitString(pastedString);
    let tagsToAdd = tags.filter((tag) => this._isTagValid(tag));

    this._addTags(tagsToAdd);
    setTimeout(() => this.inputValue = '', 100);
  }

  _splitString(tagString) {
    tagString = tagString.trim();
    let tags = tagString.split(String.fromCharCode(this.delimiter));
    return tags.filter((tag) => !!tag);
  }

  _isTagValid(tagString) {
    return this.allowedTagsPattern.test(tagString);
  }

  _addTags(tags) {
    let validTags = tags.filter((tag) => this._isTagValid(tag));

    this.tagsList = this.tagsList.concat(validTags);
    this._resetSelected();
    this._resetInput();
    this.onChangeCallback(this.tagsList);
  }

  _removeTag(tagIndexToRemove) {
    this.tagsList.splice(tagIndexToRemove, 1);
    this._resetSelected();
    this.onChangeCallback(this.tagsList);
  }

  _handleBackspace() {
    if (!this.inputValue.length && this.tagsList.length) {
        this._removeTag(this.tagsList.length - 1);
    } else {
        this.selectedTag = this.tagsList.length - 1;
    }
  }

  _resetSelected() {
    this.selectedTag = null;
  }

  _resetInput() {
    this.inputValue = '';
  }
}
