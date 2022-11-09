import { Component, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions, UploadStatus } from 'ngx-uploader';
import { BehaviorSubject, filter, first, map, Observable, OperatorFunction, single, startWith, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { get } from 'lodash';
import { StateService } from 'src/services/state.service';
import { FullState } from 'src/app/state/main';

type FileGroupFormData = {
  files: UploadFile[];
  imageId: string;
}
class FileGroupForm extends FormGroup {
  override controls: {
    files: FormArray;
    imageId: FormControl;
    originalImageId: FormControl;
  } = {
      files: new FormArray([]),
      imageId: new FormControl(),
      originalImageId: new FormControl()
    }
  constructor(init: FileGroupFormData) {
    super({})
    get(init, 'files', []).forEach(file => {
      this.controls.files.push(new FormControl(file))
    })
    this.controls.imageId.setValue(get(init, 'imageId'))
    this.controls.originalImageId.setValue(get(init, 'imageId'))
  }
}

class FileFormArray extends FormArray {
  override controls: FileGroupForm[] = [] as FileGroupForm[];
}

class UploadForm extends FormGroup {
  override controls: {
    images: FileFormArray
  } = { images: new FileFormArray([]) }
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  options: UploaderOptions;
  formData: FormData;
  files$: BehaviorSubject<UploadFile[]> = new BehaviorSubject([] as UploadFile[]);
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;
  fileDirOptions$: Observable<{ name: string }[]>;
  newFileOption = { name: 'Use Filename' }
  form: UploadForm;
  FILE_STATUS = UploadStatus;
  // @ViewChild('imageIdSelectInput') private imageIdSelectInput: TemplateRef<HTMLInputElement>;

  constructor(private store: Store<FullState>, private state: StateService) {
    this.options = { concurrency: 1, allowedContentTypes: ['image/jpeg', 'image/png', 'image/tiff'], maxFileSize: 100000000000 };
    this.formData = new FormData();
    this.dragOver = true;
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
    this.fileDirOptions$ = new BehaviorSubject([this.newFileOption])

    this.form = new UploadForm({
      images: new FileFormArray([])
    })

  }

  private getFileControl(file: UploadFile): AbstractControl | undefined {
    let fc = undefined;

    this.form.controls.images.controls.every(groupForm => {
      return groupForm.controls.files.controls.find(fileControl => {
        if (fileControl.value.id !== file.id) {
          return true;
        }

        fc = fileControl
        return false;
      })
    })

    return fc
  }

  private getInitialFileGroup(file: UploadFile): FileGroupForm | undefined {
    const genericId = this.getImageId(file)
    const groupForm = this.form.controls.images.controls.find(imForm => {
      return genericId == imForm.controls.imageId.value
    })

    return groupForm
  }

  onImageIdSelection(event: any, imageGroupForm: FileGroupForm) {
    if (event.target.value == this.newFileOption.name) {
      imageGroupForm.controls.imageId.setValue(imageGroupForm.controls.originalImageId.value)
    }
    else {
      imageGroupForm.controls.imageId.setValue(event?.target?.value)
    }
  }

  onUploadOutput(output: UploadOutput): void {
    this.files$.pipe(
      first(),
      tap(files => {
        switch (output.type) {
          case 'allAddedToQueue':
            // uncomment this if you want to auto upload files when added
            // const event: UploadInput = {
            //   type: 'uploadAll',
            //   url: '/upload',
            //   method: 'POST',
            //   data: { foo: 'bar' }
            // };
            // this.uploadInput.emit(event);
            break;
          case 'addedToQueue':
            if (typeof output.file !== 'undefined') {
              const formGroup = this.getInitialFileGroup(output.file)
              if (formGroup) {
                formGroup.controls.files.push(new FormControl(output.file))
              }
              else {
                const f = new FileGroupForm({
                  files: [output.file],
                  imageId: this.getImageId(output.file)
                });
                this.form.controls.images.push(f)
              }
            }
            break;
          case 'uploading':
          case 'removed':
          case 'done':
            if (typeof output.file !== 'undefined') {
              // update current data in files array for uploading file
              const fileControl = this.getFileControl(output.file)
              if (fileControl) {
                fileControl.setValue(output.file)
              }
            }
            break;
          case 'dragOver':
            this.dragOver = true;
            break;
          case 'dragOut':
          case 'drop':
            this.dragOver = false;
            break;
          case 'rejected':
            console.log(output.file?.name + ' rejected');
            break;
        }
      })
    ).subscribe()
  }

  getImageId(file: UploadFile): string {
    return file.name.split('.')[0].split('_masks')[0];
  }

  startGroupUpload(group: FileGroupForm): void {
    group.controls.files.controls.forEach(fileControl => {
      this.startUpload(group.controls.imageId.value, fileControl.value)
    })
  }

  startUploadAll(): void {
    this.form.controls.images.controls.forEach(fileFormGroup => {
      this.startGroupUpload(fileFormGroup)
    })
  }

  startUpload(imageId: string, file: UploadFile): void {
    const event: UploadInput = {
      type: 'uploadFile',
      url: environment.urls.upload,
      method: 'POST',
      file,
      data: {
        imageId,
        name: file.name
      }
    };

    this.uploadInput.emit(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }

  removeFile(id: string): void {
    this.uploadInput.emit({ type: 'remove', id: id });
  }

  removeAllFiles(): void {
    this.uploadInput.emit({ type: 'removeAll' });
  }
}