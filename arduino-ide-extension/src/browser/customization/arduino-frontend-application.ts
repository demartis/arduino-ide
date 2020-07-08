import { injectable, inject } from 'inversify';
import { FileSystem } from '@theia/filesystem/lib/common/filesystem';
import { CommandService } from '@theia/core/lib/common/command';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { FrontendApplication } from '@theia/core/lib/browser/frontend-application';
import { EditorMode } from '../editor-mode';
import { ArduinoCommands } from '../arduino-commands';

@injectable()
export class ArduinoFrontendApplication extends FrontendApplication {

    @inject(FileSystem)
    protected readonly fileSystem: FileSystem;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(CommandService)
    protected readonly commandService: CommandService;

    @inject(EditorMode)
    protected readonly editorMode: EditorMode;

    protected async initializeLayout(): Promise<void> {
        await super.initializeLayout();
        // If not in PRO mode, we open the sketch file with all the related files.
        // Otherwise, we reuse the workbench's restore functionality and we do not open anything at all.
        // TODO: check `otherwise`. Also, what if we check for opened editors, instead of blindly opening them?
        if (!this.editorMode.proMode) {
            const roots = await this.workspaceService.roots;
            for (const root of roots) {
                const exists = await this.fileSystem.exists(root.uri);
                if (exists) {
                    await this.commandService.executeCommand(ArduinoCommands.OPEN_SKETCH_FILES.id, root.uri);
                }
            }
        }
    }

}