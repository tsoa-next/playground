import { Controller, File, FormField, NoSecurity, Post, Route, Tags, UploadedFile, UploadedFiles } from 'tsoa-next'

@NoSecurity()
@Route('uploads')
@Tags('uploads')
export class UploadShowcaseController extends Controller {
  @Post('single')
  public single(@FormField() title: string, @UploadedFile('asset') asset: File): { title: string; name: string; bytes: number; content: string } {
    return { title, name: asset.originalname, bytes: asset.buffer.length, content: asset.buffer.toString('utf8') }
  }
  @Post('many')
  public many(@UploadedFiles('assets') assets: File[]): { names: string[]; contents: string[] } {
    return { names: assets.map(asset => asset.originalname), contents: assets.map(asset => asset.buffer.toString('utf8')) }
  }
}
