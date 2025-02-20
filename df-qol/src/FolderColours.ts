import { FolderData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import SETTINGS from "../../common/Settings";

function apply(shouldApply: boolean, hookName: string, func: AnyFunction) {
	if (shouldApply) Hooks.on(hookName, func);
	else Hooks.off(hookName, func);
}

export default class FolderColours {
	static init() {
		SETTINGS.register('folder-colour', {
			name: 'DF_QOL.FolderTextColour.Name',
			hint: 'DF_QOL.FolderTextColour.Hint',
			scope: 'world',
			type: Boolean,
			default: true,
			config: true,
			onChange: (newValue: boolean) => {
				apply(newValue, 'renderFolderConfig', FolderColours.DF_FOLDER_TEXT_COLOUR);
				apply(newValue, 'renderSceneDirectory', FolderColours.DF_SCENE_DIRECTORY_RENDER);
				ui.sidebar.render(false);
			}
		});
		apply(SETTINGS.get('folder-colour'), 'renderFolderConfig', FolderColours.DF_FOLDER_TEXT_COLOUR);
		apply(SETTINGS.get('folder-colour'), 'renderSceneDirectory', FolderColours.DF_SCENE_DIRECTORY_RENDER);
		apply(SETTINGS.get('folder-colour'), 'renderActorDirectory', FolderColours.DF_SCENE_DIRECTORY_RENDER);
		apply(SETTINGS.get('folder-colour'), 'renderItemDirectory', FolderColours.DF_SCENE_DIRECTORY_RENDER);
		apply(SETTINGS.get('folder-colour'), 'renderJournalDirectory', FolderColours.DF_SCENE_DIRECTORY_RENDER);
		apply(SETTINGS.get('folder-colour'), 'renderRollTableDirectory', FolderColours.DF_SCENE_DIRECTORY_RENDER);
		// Special hook just for Monk's Enhanced Journal
		apply(SETTINGS.get('folder-colour'), 'renderEnhancedJournal', FolderColours.DF_SCENE_DIRECTORY_RENDER);
	}

	static DF_FOLDER_TEXT_COLOUR(app: FolderConfig, html: JQuery, data: { folder: FolderData, sortingModes: { a: string, m: string }, submitText: string }) {
		if (!data.folder.flags) {
			data.folder.flags = {};
		}
		const textColour: string = data.folder.flags.textColour as string ?? "";
		html.find('button[type="submit"]').before(`<div class="form-group">
	<label>${'Text Color'}</label>
	<div class="form-fields">
		<input type="text" name="flags.textColour" value="${textColour}" data-dtype="String">
		<input type="color" value="${textColour.length == 0 ? '#f0f0e0' : textColour}" data-edit="flags.textColour">
	</div>
</div>`);
		app.setPosition({
			height: "auto"
		});
	}
	static DF_SCENE_DIRECTORY_RENDER(app: Application, html: JQuery<HTMLElement>, _data: any) {
		const colorize = (element: JQuery<HTMLElement>) => {
			const id = element[0].getAttribute('data-folder-id');
			if (id === null || id === undefined) return;
			const folder = game.folders.get(id);
			if (folder === null || folder === undefined) return;
			element.find('header *').css('color', (<any>folder.data.flags).textColour);
		};
		// If the app is Monk's Enhanced Journal, let it render first before we apply our colour
		if (app.constructor.name === 'EnhancedJournal')
			setTimeout(() => html.find('li[data-folder-id]').each((_: any, element: HTMLElement) => colorize($(element))), 10);
		else
			html.find('li[data-folder-id]').each((_: any, element: HTMLElement) => colorize($(element)));
	}
}