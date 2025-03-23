import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "@/app/hooks/useFileUpload";
import { validateImageFile } from "@/app/utils/validation/formValidation";

jest.mock("@/app/utils/validation/formValidation", () => ({
  validateImageFile: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

const mockFileReaderInstance = {
  readAsDataURL: jest.fn(),
  onload: null,
  onerror: null,
};

class MockFileReader {
  constructor() {
    Object.assign(this, mockFileReaderInstance);
    return mockFileReaderInstance;
  }
}

global.FileReader = MockFileReader;

const createMockFile = (
  name = "test.jpg",
  type = "image/jpeg",
  size = 1024,
  shouldFail = false
) => ({
  name,
  type,
  size,
  shouldFail,
});

describe("useFileUpload hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFileReaderInstance.readAsDataURL.mockReset();
    mockFileReaderInstance.onload = null;
    mockFileReaderInstance.onerror = null;

    validateImageFile.mockImplementation(() => ({
      isValid: true,
      errorMessage: "",
    }));
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.fileState).toEqual({
      data: null,
      name: null,
      type: null,
      error: null,
      preview: null,
    });
    expect(result.current.isProcessing).toBe(false);
  });

  it("should handle file selection successfully", async () => {
    const mockSetFormErrors = jest.fn();
    const mockOnFileLoaded = jest.fn();

    const { result } = renderHook(() =>
      useFileUpload({
        setFormErrors: mockSetFormErrors,
        onFileLoaded: mockOnFileLoaded,
      })
    );

    const mockFile = createMockFile();
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    };

    mockFileReaderInstance.readAsDataURL.mockImplementation((file) => {
      setTimeout(() => {
        if (mockFileReaderInstance.onload) {
          mockFileReaderInstance.onload({
            target: { result: "data:mock/data" },
          });
        }
      }, 0);
    });

    await act(async () => {
      await result.current.handleFileChange(mockEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(validateImageFile).toHaveBeenCalledWith(mockFile, {});

    expect(result.current.fileState).toEqual({
      data: "data:mock/data",
      name: mockFile.name,
      type: mockFile.type,
      error: null,
      preview: "blob:mock-url",
    });

    expect(mockOnFileLoaded).toHaveBeenCalledWith({
      data: "data:mock/data",
      name: mockFile.name,
      type: mockFile.type,
      size: mockFile.size,
      preview: "blob:mock-url",
    });

    expect(mockSetFormErrors).toHaveBeenCalled();
  });

  it("should handle validation failure - debug", async () => {
    const mockSetFormErrors = jest.fn();

    mockSetFormErrors.mockImplementation((...args) => {
      console.log(
        "mockSetFormErrors called with:",
        JSON.stringify(args, null, 2)
      );
      return {};
    });

    validateImageFile.mockImplementation(() => ({
      isValid: false,
      errorMessage: "File is too large",
    }));

    const { result } = renderHook(() =>
      useFileUpload({
        setFormErrors: mockSetFormErrors,
      })
    );

    const mockFile = createMockFile();
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    };

    await act(async () => {
      await result.current.handleFileChange(mockEvent);
    });

    expect(validateImageFile).toHaveBeenCalledWith(mockFile, {});

    expect(result.current.fileState.error).toBe("File is too large");

    console.log("All mockSetFormErrors calls:");
    console.log(mockSetFormErrors.mock.calls);

    expect(
      mockSetFormErrors.mock.calls.some((call) => {
        const updateFunction = call[0];
        if (typeof updateFunction === "function") {
          const result = updateFunction({});
          return result && result.file === "File is too large";
        }
        return false;
      })
    ).toBe(true);
  });

  it("should handle file reader error", async () => {
    const mockSetFormErrors = jest.fn();

    const { result } = renderHook(() =>
      useFileUpload({
        setFormErrors: mockSetFormErrors,
      })
    );

    const mockFile = createMockFile();
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    };

    mockFileReaderInstance.readAsDataURL.mockImplementation((file) => {
      setTimeout(() => {
        if (mockFileReaderInstance.onerror) {
          mockFileReaderInstance.onerror(new Error("Read failed"));
        }
      }, 0);
    });

    await act(async () => {
      await result.current.handleFileChange(mockEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(validateImageFile).toHaveBeenCalledWith(mockFile, {});

    expect(result.current.fileState.error).not.toBeNull();
  });

  it("should handle no file selected", async () => {
    const { result } = renderHook(() => useFileUpload());

    const mockEvent = {
      target: {
        files: [],
      },
    };

    await act(async () => {
      await result.current.handleFileChange(mockEvent);
    });

    expect(result.current.fileState).toEqual({
      data: null,
      name: null,
      type: null,
      error: null,
      preview: null,
    });

    expect(validateImageFile).not.toHaveBeenCalled();
  });

  it("should clear file state properly", async () => {
    const mockSetFormErrors = jest.fn();

    const { result } = renderHook(() =>
      useFileUpload({
        setFormErrors: mockSetFormErrors,
      })
    );

    const mockFile = createMockFile();
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    };

    mockFileReaderInstance.readAsDataURL.mockImplementation((file) => {
      setTimeout(() => {
        if (mockFileReaderInstance.onload) {
          mockFileReaderInstance.onload({
            target: { result: "data:mock/data" },
          });
        }
      }, 0);
    });

    await act(async () => {
      await result.current.handleFileChange(mockEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.fileState.preview = "blob:mock-url";
    });

    act(() => {
      result.current.clearFile();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    expect(result.current.fileState).toEqual({
      data: null,
      name: null,
      type: null,
      error: null,
      preview: null,
    });

    expect(mockSetFormErrors).toHaveBeenCalled();
  });

  it("should pass custom validation options", async () => {
    const validationOptions = {
      maxSizeInMB: 2,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    const { result } = renderHook(() =>
      useFileUpload({
        validationOptions,
      })
    );

    const mockFile = createMockFile();
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    };

    await act(async () => {
      await result.current.handleFileChange(mockEvent);
    });

    expect(validateImageFile).toHaveBeenCalledWith(mockFile, validationOptions);
  });
});
