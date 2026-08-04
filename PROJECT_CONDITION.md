# Project Condition Presentation Summary

## Project Overview

This project is a 2D C++ OpenGL survival prototype titled **Fate of the Necromancer - Prototype**. The player moves through an infinite procedural world, fights enemies, gains experience, collects tome rewards, chooses skills, and tries to survive until the run timer ends.

The project is currently a functional prototype with separated systems for rendering, gameplay, procedural world generation, enemies, skills, abilities, UI, shaders, assets, and audio.

The main loop is located in `Src/Main.cpp`:

```cpp
game.ProcessInput(deltaTime);
game.Update(deltaTime);
game.Render();

glfwSwapBuffers(window);
glfwPollEvents();
```

This creates a clear frame structure: input first, simulation second, rendering third, then the final frame is shown on screen.

## 1. Rendering Pipeline

The rendering pipeline uses a modern OpenGL style based on shaders, vertex arrays, vertex buffers, textures, uniforms, and draw calls. It is mainly implemented in `Src/Renderer.cpp`, supported by `Src/Quad.cpp`, `Src/Shader.cpp`, `Src/Texture.cpp`, and the GLSL files in `Src/Shaders/`.

The project renders almost everything using one reusable quad mesh. World tiles, obstacles, enemies, player sprites, abilities, HUD elements, text, fog, and overlays are all drawn as either colored quads or textured quads.

### Rendering Files

| File | Role In Rendering Pipeline |
| --- | --- |
| `Src/Main.cpp` | Initializes GLFW/GLEW, creates the window, enables blending, loads shaders and textures |
| `Src/Shader.cpp` | Compiles vertex and fragment shaders, links the shader program, and sends uniforms |
| `Src/Texture.cpp` | Loads image files with `stb_image` and creates OpenGL textures |
| `Src/Quad.cpp` | Creates the VAO/VBO quad geometry and performs the final draw call |
| `Src/Renderer.cpp` | Builds matrices, binds textures, sets shader uniforms, and draws game objects |
| `Src/Shaders/vertex.glsl` | Applies the `uMVP` transform to vertices |
| `Src/Shaders/fragment.glsl` | Samples textures or outputs solid colors |

### Rendering Flow

1. `Main.cpp` initializes OpenGL and enables alpha blending with `glEnable(GL_BLEND)`.
2. `Shader` loads `Src/Shaders/vertex.glsl` and `Src/Shaders/fragment.glsl`.
3. `Texture` loads PNG assets from the `Assets/` folder and uploads them to the GPU.
4. `Quad` creates a reusable VAO/VBO made from two triangles.
5. `Game::Render()` decides the visual order of the scene.
6. `Renderer::BeginFrame()` clears the screen and builds the camera view-projection matrix.
7. Each object gets a model matrix for position, scale, and sometimes rotation.
8. The final `uMVP` matrix and texture frame data are sent to the shader.
9. `Quad::Draw()` calls `glDrawArrays(GL_TRIANGLES, 0, 6)`.
10. `Main.cpp` presents the final image with `glfwSwapBuffers(window)`.

### Actual Rendering Pipeline Code Snippet

This snippet from `Src/Renderer.cpp` shows the real rendering pipeline. It clears the frame, creates the camera view matrix, combines it with the projection matrix, sends texture and transform data to the shader, and draws the quad.

```cpp
void Renderer::BeginFrame(const glm::vec2& cameraPosition)
{
    glClearColor(0.10f, 0.10f, 0.12f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    glm::mat4 view =
        glm::translate(
            glm::mat4(1.0f),
            glm::vec3(-cameraPosition, 0.0f));

    viewProjection = projection * view;

    shader->Use();
}

void Renderer::DrawTexturedQuad(
    const glm::vec2& position,
    const glm::vec2& size,
    const glm::vec2& frameOffset,
    const glm::vec2& frameScale,
    const glm::vec4& tint)
{
    glm::mat4 model =
        glm::translate(
            glm::mat4(1.0f),
            glm::vec3(position, 0.0f));

    model =
        glm::scale(
            model,
            glm::vec3(size, 1.0f));

    shader->SetMat4("uMVP", viewProjection * model);
    shader->SetVec4("uColor", tint);
    shader->SetInt("uUseTexture", 1);
    shader->SetVec2("uFrameOffset", frameOffset);
    shader->SetVec2("uFrameScale", frameScale);
    shader->SetInt("uTexture", 0);

    quad->Draw();
}
```

The final GPU draw call happens in `Src/Quad.cpp`:

```cpp
void Quad::Draw() const
{
    glBindVertexArray(VAO);
    glDrawArrays(GL_TRIANGLES, 0, 6);
    glBindVertexArray(0);
}
```

The shader stage is visible in `Src/Shaders/vertex.glsl` and `Src/Shaders/fragment.glsl`. The vertex shader transforms each quad vertex with `uMVP`, and the fragment shader either samples a sprite-sheet texture or outputs a flat color.

## 2. Game Architecture

The game architecture is organized around a central `Game` class. `Game` owns and coordinates the player, world, enemies, renderer, skills, abilities, camera, timer, victory state, and game-over state.

`Main.cpp` is responsible for application setup and the main loop. It does not contain the main gameplay rules. Gameplay logic is moved into focused classes, making the architecture easier to read and maintain.

### Main Architecture Classes

| Class | Location | Responsibility |
| --- | --- | --- |
| `Game` | `Src/Game.cpp`, `Src/Headers/Game.h` | Main controller for input, update, rendering order, camera, run state, victory, and game over |
| `Player` | `Src/Player.cpp`, `Src/Headers/Player.h` | Movement, health, leveling, animation frames, and player state |
| `World` | `Src/World.cpp`, `Src/Headers/World.h` | Infinite procedural world generation and obstacle collision |
| `EnemyManager` | `Src/EnemyManager.cpp`, `Src/Headers/EnemyManager.h` | Enemy spawning, bosses, movement, damage, experience, kills, and tome drops |
| `SkillManager` | `Src/SkillManager.cpp`, `Src/Headers/SkillManager.h` | Skill slots, skill levels, random choices, unlocking, and upgrading |
| `FireballAbility` | `Src/Headers/FireballAbility.h` | Fireball skill behavior |
| `SummonSkeletonAbility` | `Src/SummonSkeletonAbility.cpp`, `Src/Headers/SummonSkeletonAbility.h` | Skeleton companion skill behavior |
| `Renderer` | `Src/Renderer.cpp`, `Src/Headers/Renderer.h` | Draws the current game state |

### Update Architecture

`Game::Update()` in `Src/Game.cpp` is the central simulation step. It updates player animation, abilities, camera position, enemy behavior, enemy damage, experience gain, level-up choices, tome collection, victory, and game-over state.

The update side of the project is separated from rendering. This means gameplay systems decide what happens, while the renderer only displays the final state.

### Render Architecture

`Game::Render()` controls the render order:

```cpp
void Game::Render()
{
    renderer.BeginFrame(cameraPosition);
    renderer.RenderWorld(world, cameraPosition);
    renderer.RenderTomes(enemyManager, runTimer);
    renderer.RenderEnemies(enemyManager);
    renderer.RenderFireballAbility(fireballAbility);
    renderer.RenderSkeletonAbility(skeletonAbility);
    renderer.RenderPlayer(player);
    renderer.RenderFogOverlay(cameraPosition, runTimer);
    renderer.RenderHud(player);
    renderer.RenderTimer(kRunDurationSeconds - runTimer);
    renderer.RenderAbilityBar(BuildAbilitySlotDisplays());
    renderer.EndFrame();
}
```

This order creates correct visual layering: the world is drawn first, gameplay objects are drawn next, and HUD or overlay elements are drawn last.

## 3. Project Structure And Modular Design

The project is structured to keep code readable and maintainable. Source files, headers, shaders, assets, audio, and dependencies are organized into separate folders.

### Folder Organization

```text
Assignment-03/
  Assets/
    Player, enemy, ground, obstacle, fireball, skeleton, arrow, and UI image files
  Src/
    Main.cpp
    Game.cpp
    Renderer.cpp
    Shader.cpp
    Texture.cpp
    Quad.cpp
    Player.cpp
    World.cpp
    EnemyManager.cpp
    SkillManager.cpp
    SummonSkeletonAbility.cpp
    Headers/
      Game.h
      Renderer.h
      Shader.h
      Texture.h
      Quad.h
      Player.h
      World.h
      EnemyManager.h
      SkillManager.h
      FireballAbility.h
      SummonSkeletonAbility.h
      Miniaudio.h
      stb_image.h
    Shaders/
      vertex.glsl
      fragment.glsl
    Sound/
      soundtrack.mp3
    Dependencies/
      glm/
```

### Source File Organization

The `.cpp` files are separated by system:

| Source File | Purpose |
| --- | --- |
| `Src/Main.cpp` | Window setup, OpenGL setup, asset loading, and main loop |
| `Src/Game.cpp` | Main game coordination, input, update, render calls, reset, victory, and defeat |
| `Src/Renderer.cpp` | Rendering functions for world, entities, abilities, HUD, and overlays |
| `Src/Shader.cpp` | Shader loading, compiling, linking, and uniform setting |
| `Src/Texture.cpp` | Texture loading and OpenGL texture setup |
| `Src/Quad.cpp` | Reusable quad mesh setup and drawing |
| `Src/Player.cpp` | Player state, health, movement values, experience, and animation |
| `Src/World.cpp` | Procedural tile generation and collision checks |
| `Src/EnemyManager.cpp` | Enemy and boss behavior |
| `Src/SkillManager.cpp` | Skill slots, choices, and level-up logic |
| `Src/SummonSkeletonAbility.cpp` | Skeleton companion behavior |

### Shader Files

Shader files are isolated in `Src/Shaders/`:

| Shader File | Purpose |
| --- | --- |
| `Src/Shaders/vertex.glsl` | Transforms quad vertices using the `uMVP` matrix |
| `Src/Shaders/fragment.glsl` | Handles texture sampling, sprite-sheet frame selection, transparency discard, and flat color output |

Keeping shader files separate from C++ files makes it easier to edit GPU rendering behavior without mixing it with gameplay logic.

### Asset Management

Assets are stored in the `Assets/` folder and loaded at startup from `Src/Main.cpp` using the `Texture` class.

| Asset Type | Examples |
| --- | --- |
| Player sprites | `Assets/Idle.png`, `Assets/Walk.png`, `Assets/Player_icon.png` |
| World textures | `Assets/ground1.png`, `Assets/ground2.png`, `Assets/ground3.png`, `Assets/jungle_tree.png`, `Assets/Rocks.png` |
| Enemy assets | `Assets/enemy_skull.png` |
| Ability assets | `Assets/MainAttack.png`, `Assets/Arrow.png` |
| Companion assets | `Assets/skeleton_companion_idle.png`, `Assets/skeleton_companion_walk.png`, `Assets/skeleton_companion_shoot.png` |

Example from `Src/Main.cpp`:

```cpp
Texture playerTexture("Assets/Idle.png", true);
Texture playerWalkTexture("Assets/Walk.png", true);
Texture fireballTexture("Assets/MainAttack.png", true);
Texture groundTexture1("Assets/ground1.png", true);
```

The `Texture` class in `Src/Texture.cpp` handles loading image data with `stb_image`, setting texture wrapping and filtering, and uploading the result to OpenGL. This keeps asset loading centralized instead of spreading image-loading code through gameplay systems.

### Modular Design

The modular design is based on each system having one clear responsibility:

1. `Main.cpp` handles application setup.
2. `Game` coordinates the game loop and high-level state.
3. `Renderer` handles drawing only.
4. `World` handles procedural map data and collision only.
5. `EnemyManager` handles enemies and rewards.
6. `SkillManager` handles skill slots and choices.
7. Ability classes handle concrete skill behavior.
8. `Shader`, `Texture`, and `Quad` isolate OpenGL-specific details.

This makes the project easier to extend. A new skill can be added by creating a new ability class, adding it to `SkillManager`, and mapping its icon/display in `Game`. A new enemy can be added mainly through `EnemyManager` and rendered through `Renderer`. A new asset can be added to `Assets/` and loaded through `Texture` in `Main.cpp`.

Overall, the project structure keeps gameplay logic, rendering logic, asset loading, shader code, and reusable OpenGL utilities separated, which makes the prototype easier to present, debug, and expand.
